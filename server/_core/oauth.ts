import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { notifyOwner } from "./notification";

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
    if (!email || !password) { res.status(400).json({ error: "email and password are required" }); return; }
    try {
      const existing = await db.getUserByEmail(email);
      if (existing) { res.status(409).json({ error: "Email already in use" }); return; }
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
