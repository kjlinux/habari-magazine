import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import ImagePickerWithAI from "@/components/ImagePickerWithAI";

type PartnerCategory = "communique" | "sponsored" | "report";

const categoryOptions: { value: PartnerCategory; label: string }[] = [
  { value: "communique", label: "Communiqué" },
  { value: "sponsored", label: "Article sponsorisé" },
  { value: "report", label: "Rapport" },
];

interface FormData {
  title: string;
  category: PartnerCategory;
  source: string;
  excerpt: string;
  content: string;
  tag: string;
  image: string;
  externalLink: string;
  featured: boolean;
  published: boolean;
  publishedAt: string;
}

const defaultForm: FormData = {
  title: "",
  category: "communique",
  source: "",
  excerpt: "",
  content: "",
  tag: "",
  image: "",
  externalLink: "",
  featured: false,
  published: true,
  publishedAt: "",
};

export default function AdminPartnerForm() {
  const [, params] = useRoute("/admin/partenaires/:id");
  const [, navigate] = useLocation();
  const isNew = params?.id === "nouveau";
  const editId = isNew ? null : params?.id ? parseInt(params.id) : null;

  const [form, setForm] = useState<FormData>(defaultForm);

  const { data: existing } = trpc.admin.partners.byId.useQuery(
    { id: editId! },
    { enabled: editId !== null }
  );

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || "",
        category: (existing.category as PartnerCategory) || "communique",
        source: existing.source || "",
        excerpt: existing.excerpt || "",
        content: existing.content || "",
        tag: existing.tag || "",
        image: existing.image || "",
        externalLink: existing.externalLink || "",
        featured: existing.featured ?? false,
        published: existing.published ?? true,
        publishedAt: existing.publishedAt ? new Date(existing.publishedAt).toISOString().slice(0, 10) : "",
      });
    }
  }, [existing]);

  const createMutation = trpc.admin.partners.create.useMutation({
    onSuccess: () => { toast.success("Contenu créé"); navigate("/admin/partenaires"); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const updateMutation = trpc.admin.partners.update.useMutation({
    onSuccess: () => { toast.success("Contenu mis à jour"); navigate("/admin/partenaires"); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      source: form.source.trim() || undefined,
      excerpt: form.excerpt.trim() || undefined,
      content: form.content.trim() || undefined,
      tag: form.tag.trim() || undefined,
      image: form.image.trim() || undefined,
      externalLink: form.externalLink.trim() || undefined,
      featured: form.featured,
      published: form.published,
      publishedAt: form.publishedAt ? new Date(form.publishedAt) : undefined,
    };

    if (editId !== null) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/partenaires")} className="font-sans gap-1">
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {editId !== null ? "Modifier le contenu" : "Nouveau contenu partenaire"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="font-serif">Contenu</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Titre *</label>
                <input
                  type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Catégorie *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as PartnerCategory })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  >
                    {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Source / Partenaire</label>
                  <input
                    type="text" value={form.source}
                    placeholder="Nom du partenaire ou de l'émetteur"
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Résumé</label>
                <textarea
                  value={form.excerpt} rows={3}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Contenu complet</label>
                <textarea
                  value={form.content} rows={8}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-serif">Médias & liens</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Tag</label>
                  <input
                    type="text" value={form.tag}
                    placeholder="Énergie, Finance..."
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <ImagePickerWithAI
                    label="Image"
                    value={form.image}
                    onChange={(url) => setForm({ ...form, image: url })}
                    folder="partners"
                    uploadEndpoint="/api/upload/image"
                    aiPromptContext={`Partner image for: "${form.name || ""}"`}
                    previewHeight="h-40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Lien externe</label>
                <input
                  type="url" value={form.externalLink}
                  placeholder="https://..."
                  onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-serif">Publication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Date de publication</label>
                <input
                  type="date" value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-sans">
                <input
                  type="checkbox" checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Publié (visible sur le site)
              </label>
              <label className="flex items-center gap-2 text-sm font-sans">
                <input
                  type="checkbox" checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                À la une
              </label>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/partenaires")} className="font-sans">
              Annuler
            </Button>
            <Button type="submit" disabled={isPending} className="font-sans gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId !== null ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
