import type { Express, Request, Response } from "express";
import { getArticleBySlug, getUserSubscription } from "./db";
import { sdk } from "./_core/sdk";
import { canAccessArticle } from "./_core/access";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function registerArticleRoutes(app: Express) {
  app.get("/api/articles/:slug/pdf", async (req: Request, res: Response) => {
    try {
      const slug = decodeURIComponent(req.params.slug);
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user) {
        res.status(401).send("Authentification requise");
        return;
      }
      const article = await getArticleBySlug(slug);
      if (!article) {
        res.status(404).send("Article introuvable");
        return;
      }
      const sub = await getUserSubscription(user.id);
      const access = canAccessArticle(user, article, sub ?? null);
      if (!access.allowed) {
        res.status(403).send("Abonnement requis pour télécharger cet article");
        return;
      }

      const dateStr = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "";

      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(article.title)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; line-height: 1.6; max-width: 780px; margin: 0 auto; padding: 24px; }
  header { border-bottom: 2px solid #D4A017; padding-bottom: 12px; margin-bottom: 24px; }
  .brand { font-size: 12px; color: #D4A017; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
  h1 { font-size: 26px; margin: 8px 0 6px; color: #1a2a4f; line-height: 1.25; }
  .meta { font-size: 12px; color: #666; }
  .featured { width: 100%; max-height: 320px; object-fit: cover; border-radius: 6px; margin: 12px 0 18px; }
  .content { font-size: 14px; }
  .content h1, .content h2, .content h3 { color: #1a2a4f; font-family: Georgia, serif; margin-top: 1.4em; }
  .content h1 { font-size: 22px; }
  .content h2 { font-size: 18px; }
  .content h3 { font-size: 16px; }
  .content p { margin: 0 0 1em; text-align: justify; }
  .content img { max-width: 100%; height: auto; border-radius: 4px; margin: 12px 0; display: block; }
  .content blockquote { border-left: 3px solid #D4A017; padding-left: 12px; color: #555; font-style: italic; margin: 1em 0; }
  .content a { color: #1a2a4f; text-decoration: underline; }
  .content table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  .content td, .content th { border: 1px solid #ccc; padding: 6px 8px; }
  footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #888; text-align: center; }
  @media print { .no-print { display: none !important; } }
</style>
</head>
<body>
  <header>
    <div class="brand">Habari Magazine</div>
    <h1>${escapeHtml(article.title)}</h1>
    <div class="meta">${dateStr ? escapeHtml(dateStr) : ""}</div>
  </header>
  ${article.featuredImage ? `<img class="featured" src="${escapeHtml(article.featuredImage)}" alt="">` : ""}
  ${article.excerpt ? `<p style="font-size:15px;color:#444;font-style:italic;margin-bottom:18px;">${escapeHtml(article.excerpt)}</p>` : ""}
  <div class="content">${article.content || ""}</div>
  <footer>© Habari Magazine — habarimag.online</footer>
  <script>
    window.addEventListener("load", () => { setTimeout(() => window.print(), 400); });
  </script>
</body>
</html>`;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err) {
      console.error("[Article PDF] Error:", err);
      res.status(500).send("Erreur lors de la génération du PDF");
    }
  });
}
