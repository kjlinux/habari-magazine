import { Router, Request, Response } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { createContext } from "./_core/context";
import type { IncomingMessage, ServerResponse } from "http";

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

export function registerUploadRoutes(app: any) {
  app.use(router);
}
