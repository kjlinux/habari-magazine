import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { notifyOwner } from "./notification";

// In-memory password reset tokens (replace with DB/Redis in production)
const resetTokens = new Map<string, { userId: number; email: string; expiresAt: number }>();
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function cleanExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of resetTokens) {
    if (data.expiresAt < now) resetTokens.delete(token);
  }
}

export function registerAuthRoutes(app: Express) {
  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) { res.status(400).json({ error: "email and password are required" }); return; }
    try {
      const user = await db.getUserByEmail(email);
      if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }
      const bcrypt = await import("bcryptjs");
      const valid = await bcrypt.compare(password, user.passwordHash ?? "");
      if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
      const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name ?? "", expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.json({ ok: true });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body ?? {};
    if (!email || !password) { res.status(400).json({ error: "Email et mot de passe sont requis" }); return; }
    if (typeof password !== "string" || password.length < 8) { res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" }); return; }
    try {
      const existing = await db.getUserByEmail(email);
      if (existing) { res.status(409).json({ error: "Cette adresse email est déjà utilisée" }); return; }
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(password, 12);
      const openId = crypto.randomUUID();
      await db.upsertUser({ openId, email, name: name ?? null, passwordHash, loginMethod: "email", lastSignedIn: new Date() });

      // Welcome notification for new users
      const userName = name || "Nouveau lecteur";
      const LAUNCH_END = new Date("2026-06-01T00:00:00Z");
      const isLaunchPeriod = new Date() < LAUNCH_END;
      const launchMessage = isLaunchPeriod
        ? `\n\n🎁 OFFRE DE LANCEMENT : Jusqu'au 1er juin 2026, accès gratuit à tout le contenu premium Habari Magazine !`
        : "";
      notifyOwner({
        title: `🆕 Nouvel inscrit : ${userName}`,
        content: `Un nouveau lecteur vient de s'inscrire.\n\nNom : ${userName}\nEmail : ${email}\nDate : ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}${launchMessage}`,
      }).catch((err) => console.warn("[Auth] Welcome notification failed:", err));

      const sessionToken = await sdk.createSessionToken(openId, { name: name ?? "", expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
    res.json({ ok: true });
  });

  // Forgot password — generate reset token
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    if (!email) { res.status(400).json({ error: "L'adresse email est requise" }); return; }
    try {
      cleanExpiredTokens();
      const user = await db.getUserByEmail(email);
      // Always return success to prevent email enumeration
      if (!user) { res.json({ ok: true }); return; }
      const token = crypto.randomUUID();
      resetTokens.set(token, { userId: user.id, email, expiresAt: Date.now() + RESET_TOKEN_TTL_MS });

      const origin = `${req.protocol}://${req.get("host")}`;
      const resetUrl = `${origin}/reinitialiser-mot-de-passe?token=${token}`;

      // Notify site owner with the reset link (no user-facing email service available)
      notifyOwner({
        title: `🔑 Demande de réinitialisation : ${email}`,
        content: `L'utilisateur ${email} a demandé une réinitialisation de mot de passe.\n\nLien de réinitialisation (valide 1h) :\n${resetUrl}\n\nTransmettez ce lien à l'utilisateur.`,
      }).catch((err) => console.warn("[Auth] Reset notification failed:", err));

      console.log(`[Auth] Password reset requested for ${email}. Token: ${token}`);
      res.json({ ok: true });
    } catch (error) {
      console.error("[Auth] Forgot password failed", error);
      res.status(500).json({ error: "Erreur lors de la demande" });
    }
  });

  // Reset password — validate token and set new password
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const { token, newPassword } = req.body ?? {};
    if (!token || !newPassword) { res.status(400).json({ error: "Token et nouveau mot de passe requis" }); return; }
    if (typeof newPassword !== "string" || newPassword.length < 8) { res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" }); return; }
    try {
      cleanExpiredTokens();
      const tokenData = resetTokens.get(token);
      if (!tokenData) { res.status(400).json({ error: "Lien invalide ou expiré. Veuillez refaire une demande." }); return; }
      const bcrypt = await import("bcryptjs");
      const newHash = await bcrypt.hash(newPassword, 12);
      await db.updateUserPassword(tokenData.userId, newHash);
      resetTokens.delete(token);
      res.json({ ok: true });
    } catch (error) {
      console.error("[Auth] Reset password failed", error);
      res.status(500).json({ error: "Erreur lors de la réinitialisation" });
    }
  });

  // Validate reset token (check if still valid, for the frontend page)
  app.get("/api/auth/validate-reset-token", (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) { res.status(400).json({ valid: false }); return; }
    cleanExpiredTokens();
    const tokenData = resetTokens.get(token);
    res.json({ valid: !!tokenData, email: tokenData?.email ?? null });
  });

  // Change password (requires current password)
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user) { res.status(401).json({ error: "Non authentifié" }); return; }
      const { currentPassword, newPassword } = req.body ?? {};
      if (!currentPassword || !newPassword) { res.status(400).json({ error: "Les deux mots de passe sont requis" }); return; }
      if (typeof newPassword !== "string" || newPassword.length < 8) { res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" }); return; }
      const bcrypt = await import("bcryptjs");
      const valid = await bcrypt.compare(currentPassword, user.passwordHash ?? "");
      if (!valid) { res.status(401).json({ error: "Mot de passe actuel incorrect" }); return; }
      const newHash = await bcrypt.hash(newPassword, 12);
      await db.updateUserPassword(user.id, newHash);
      res.json({ ok: true });
    } catch (error) {
      console.error("[Auth] Change password failed", error);
      res.status(500).json({ error: "Échec du changement de mot de passe" });
    }
  });

  // Current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ id: user.openId, name: user.name, email: user.email });
    } catch {
      res.status(401).json({ error: "Unauthenticated" });
    }
  });
}
