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
      const isMagazineCover = folder === "magazine-covers";

      let enhancedPrompt: string;
      let imageSize: "1024x1024" | "1536x1024" | "1024x1536";

      if (isAvatar) {
        // Avatar: square 32px display, portrait crop
        enhancedPrompt = `Cartoon animated character portrait avatar, square format 1:1 ratio, centered face and shoulders, illustration style, colorful and friendly, suitable for a journalist profile picture. ${prompt}. Digital art, flat design or 3D cartoon style, no real photos.`;
        imageSize = "1024x1024";
      } else if (isMagazineCover) {
        // Magazine cover: portrait 3:4 ratio (aspect-[3/4] max-h-64)
        enhancedPrompt = `Professional magazine cover, portrait orientation 3:4 aspect ratio, tall vertical format, editorial design, bold composition with strong visual hierarchy. ${prompt}. High quality print photography, suitable for a news magazine front cover, photorealistic, striking and impactful.`;
        imageSize = "1024x1536";
      } else {
        // Article hero & cards: wide landscape 16:9, object-cover
        enhancedPrompt = `Professional magazine editorial photography, wide landscape format 16:9 aspect ratio, horizontally composed, photorealistic, high quality press photo. ${prompt}. Shot with professional camera, natural lighting, sharp focus, suitable for a news magazine article. Real people, real places, documentary style. IMPORTANT: no text, no title, no caption, no overlay, no watermark on the image.`;
        imageSize = "1536x1024";
      }

      const response = await openai.images.generate({
        model: "gpt-image-1.5",
        prompt: enhancedPrompt,
        size: imageSize,
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
