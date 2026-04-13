import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { notifyOwner } from "./notification";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // Check if this is a new user (first-time registration)
      const existingUser = await db.getUserByOpenId(userInfo.openId);
      const isNewUser = !existingUser;

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Send welcome notification for new users
      if (isNewUser) {
        const userName = userInfo.name || "Nouveau lecteur";
        const LAUNCH_END = new Date("2026-06-01T00:00:00Z");
        const isLaunchPeriod = new Date() < LAUNCH_END;
        const launchMessage = isLaunchPeriod
          ? `\n\n🎁 OFFRE DE LANCEMENT : Jusqu'au 1er juin 2026, vous bénéficiez d'un accès gratuit à l'intégralité du contenu premium Habari Magazine ! Téléchargez tous les numéros PDF, lisez les dossiers exclusifs et accédez aux analyses approfondies sur l'économie de la CEMAC et de la CEEAC.`
          : "";
        
        notifyOwner({
          title: `🆕 Nouvel inscrit : ${userName}`,
          content: `Un nouveau lecteur vient de s'inscrire sur Habari Magazine.\n\nNom : ${userName}\nEmail : ${userInfo.email || "Non renseigné"}\nMéthode : ${userInfo.loginMethod ?? userInfo.platform ?? "Inconnue"}\nDate : ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}${launchMessage}`,
        }).catch((err) => console.warn("[OAuth] Welcome notification failed:", err));
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
