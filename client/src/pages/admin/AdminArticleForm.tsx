import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import RichEditor from "@/components/RichEditor";
import ImagePickerWithAI from "@/components/ImagePickerWithAI";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminArticleForm() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isEditing = params.id && params.id !== "nouveau";
  const articleId = isEditing ? parseInt(params.id!) : undefined;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [authorId, setAuthorId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [countryId, setCountryId] = useState<number | undefined>();
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [accessLevel, setAccessLevel] = useState<"free" | "premium" | "integral">("free");

  const { data: article, isLoading: loadingArticle } = trpc.admin.articles.byId.useQuery(
    { id: articleId! },
    { enabled: !!articleId }
  );

  const { data: categories } = trpc.admin.categories.list.useQuery();
  const { data: countries } = trpc.admin.countries.list.useQuery();
  const { data: authors } = trpc.admin.authors.list.useQuery();

  const utils = trpc.useUtils();

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setSlugManual(true);
      setExcerpt(article.excerpt || "");
      setContent(article.content);
      setAuthorId(article.authorId ?? undefined);
      setCategoryId(article.categoryId ?? undefined);
      setCountryId(article.countryId ?? undefined);
      setFeaturedImage(article.featuredImage || "");
      setStatus(article.status);
      setAccessLevel(article.minSubscriptionTier);
    }
  }, [article]);

  useEffect(() => {
    if (!slugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  const createMutation = trpc.admin.articles.create.useMutation({
    onSuccess: (data) => {
      toast.success("Article créé avec succès");
      utils.admin.articles.list.invalidate();
      utils.admin.stats.invalidate();
      setLocation("/admin/articles");
    },
    onError: (err) => toast.error(`Erreur : ${err.message}`),
  });

  const updateMutation = trpc.admin.articles.update.useMutation({
    onSuccess: () => {
      toast.success("Article mis à jour avec succès");
      utils.admin.articles.list.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: (err) => toast.error(`Erreur : ${err.message}`),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = (saveStatus?: "draft" | "published") => {
    const finalStatus = saveStatus || status;
    const data = {
      title,
      slug,
      excerpt: excerpt || undefined,
      content,
      authorId: authorId || undefined,
      categoryId: categoryId || undefined,
      countryId: countryId || undefined,
      featuredImage: featuredImage || undefined,
      status: finalStatus,
      minSubscriptionTier: accessLevel,
    };

    if (!title.trim() || !content.trim()) {
      toast.error("Le titre et le contenu sont obligatoires");
      return;
    }

    if (isEditing && articleId) {
      updateMutation.mutate({ id: articleId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditing && loadingArticle) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/admin/articles")} title="Retour aux articles" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {isEditing ? "Modifier l'article" : "Nouvel article"}
              </h1>
              <p className="text-sm text-muted-foreground font-sans mt-0.5">
                {isEditing ? "Modifiez les informations de l'article" : "Créez un nouvel article pour la plateforme"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving} className="font-sans">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer brouillon
            </Button>
            <Button onClick={() => handleSave("published")} disabled={isSaving} className="font-sans bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
              Publier
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Titre *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'article..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="slug-de-l-article"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/30 text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Extrait</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Résumé court de l'article (affiché dans les listes)..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Contenu *</label>
              <RichEditor
                value={content}
                onChange={setContent}
                placeholder="Rédigez le contenu de l'article ici..."
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-serif font-bold text-foreground">Métadonnées</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Auteur</label>
                <select
                  title="Auteur"
                  value={authorId ?? ""}
                  onChange={(e) => setAuthorId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="">— Aucun auteur —</option>
                  {authors?.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Rubrique</label>
                <select
                  title="Rubrique"
                  value={categoryId ?? ""}
                  onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="">— Aucune rubrique —</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Pays</label>
                <select
                  title="Pays"
                  value={countryId ?? ""}
                  onChange={(e) => setCountryId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="">— Aucun pays —</option>
                  {countries?.map((c) => (
                    <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Niveau d'accès</label>
                <select
                  title="Niveau d'accès"
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="free">Accès libre</option>
                  <option value="premium">Accès Premium</option>
                  <option value="integral">Habari Intégral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Statut</label>
                <select
                  title="Statut"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            <ImagePickerWithAI
              label="Image à la une"
              value={featuredImage}
              onChange={setFeaturedImage}
              folder="magazine-covers"
              uploadEndpoint="/api/upload/magazine"
              aiPromptContext={`Professional editorial magazine cover image for an article titled: "${title}". ${excerpt}`}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
