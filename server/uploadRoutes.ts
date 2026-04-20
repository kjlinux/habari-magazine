import { Router, Request, Response } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { createContext } from "./_core/context";
import type { IncomingMessage, ServerResponse } from "http";
import OpenAI from "openai";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé"));
    }
  },
});

const router = Router();

router.post(
  "/api/upload/magazine",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      // Check admin access
      const ctx = await createContext({
        req: req as unknown as IncomingMessage & { headers: Record<string, string> },
        res: res as unknown as ServerResponse,
      } as any);

      if (!ctx.user || ctx.user.role !== "admin") {
        res.status(403).json({ error: "Accès réservé aux administrateurs" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "Aucun fichier fourni" });
        return;
      }

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const ext = req.file.originalname.split(".").pop() || "bin";
      const folder = req.file.mimetype === "application/pdf" ? "magazine-pdfs" : "magazine-covers";
      const fileKey = `${folder}/${timestamp}-${randomSuffix}.${ext}`;

      const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

      res.json({ url, key: fileKey });
    } catch (error) {
      console.error("[Upload] Error:", error);
      res.status(500).json({ error: "Erreur lors de l'upload" });
    }
  }
);

router.post(
  "/api/upload/image",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const ctx = await createContext({
        req: req as unknown as IncomingMessage & { headers: Record<string, string> },
        res: res as unknown as ServerResponse,
      } as any);

      if (!ctx.user || ctx.user.role !== "admin") {
        res.status(403).json({ error: "Accès réservé aux administrateurs" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "Aucun fichier fourni" });
        return;
      }

      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/x-icon"];
      if (!allowed.includes(req.file.mimetype)) {
        res.status(400).json({ error: "Type de fichier non autorisé (images uniquement)" });
        return;
      }

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const ext = req.file.originalname.split(".").pop() || "jpg";
      const folder = (req.query.folder as string) || "uploads";
      const fileKey = `${folder}/${timestamp}-${randomSuffix}.${ext}`;

      const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

      res.json({ url, key: fileKey });
    } catch (error) {
      console.error("[Upload Image] Error:", error);
      res.status(500).json({ error: "Erreur lors de l'upload" });
    }
  }
);

router.post(
  "/api/generate/image",
  async (req: Request, res: Response) => {
    try {
      const ctx = await createContext({
        req: req as unknown as IncomingMessage & { headers: Record<string, string> },
        res: res as unknown as ServerResponse,
      } as any);

      if (!ctx.user || ctx.user.role !== "admin") {
        res.status(403).json({ error: "Accès réservé aux administrateurs" });
        return;
      }

      const { prompt, folder = "ai-generated" } = req.body as { prompt: string; folder?: string };
      if (!prompt?.trim()) {
        res.status(400).json({ error: "Le prompt est requis" });
        return;
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === "sk-...") {
        res.status(500).json({ error: "OPENAI_API_KEY non configurée" });
        return;
      }

      const openai = new OpenAI({ apiKey });
      const isAvatar = folder === "avatars";
      const enhancedPrompt = isAvatar
        ? `Cartoon animated character portrait avatar, illustration style, colorful and friendly, suitable for a journalist profile picture. ${prompt}. Digital art, flat design or 3D cartoon style, no real photos.`
        : `Professional magazine editorial photography, photorealistic, high quality press photo. ${prompt}. Shot with professional camera, natural lighting, sharp focus, suitable for a news magazine cover or article illustration. Real people, real places, documentary style.`;
      const response = await openai.images.generate({
        model: "gpt-image-1.5",
        prompt: enhancedPrompt,
        size: "1024x1024",
        quality: "high",
        n: 1,
      });

      const imageData = response.data?.[0];
      if (!imageData) {
        res.status(500).json({ error: "Aucune image générée" });
        return;
      }

      let imageBuffer: Buffer;
      if (imageData.b64_json) {
        imageBuffer = Buffer.from(imageData.b64_json, "base64");
      } else if (imageData.url) {
        const fetchRes = await fetch(imageData.url);
        imageBuffer = Buffer.from(await fetchRes.arrayBuffer());
      } else {
        res.status(500).json({ error: "Format d'image non supporté" });
        return;
      }

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `${folder}/${timestamp}-${randomSuffix}.png`;
      const { url } = await storagePut(fileKey, imageBuffer, "image/png");

      res.json({ url, key: fileKey });
    } catch (error: any) {
      console.error("[GenerateImage] Error:", error);
      res.status(500).json({ error: error?.message || "Erreur lors de la génération" });
    }
  }
);

export function registerUploadRoutes(app: any) {
  app.use(router);
}
