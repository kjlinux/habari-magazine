import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff, Download, Upload, FileText, X, Star } from "lucide-react";
import { useState, useRef } from "react";
import ImagePickerWithAI from "@/components/ImagePickerWithAI";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MagazineIssue = {
  id: number;
  issueNumber: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  pdfUrl: string | null;
  pdfFileKey: string | null;
  coverFileKey: string | null;
  pageCount: number | null;
  isPremium: boolean;
  isPublished: boolean;
  publishedAt: Date | null;
  downloadCount: number | null;
  sommaire: string | null;
  createdAt: Date | null;
};

type FormData = {
  issueNumber: string;
  title: string;
  description: string;
  coverUrl: string;
  pdfUrl: string;
  pdfFileKey: string;
  coverFileKey: string;
  pageCount: number | undefined;
  isPremium: boolean;
  isPublished: boolean;
  sommaire: string;
};

const emptyForm: FormData = {
  issueNumber: "",
  title: "",
  description: "",
  coverUrl: "",
  pdfUrl: "",
  pdfFileKey: "",
  coverFileKey: "",
  pageCount: undefined,
  isPremium: true,
  isPublished: false,
  sommaire: "",
};

export default function AdminMagazine() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: issues, isLoading } = trpc.admin.magazineIssues.list.useQuery();

  const { data: featuredSetting } = trpc.admin.settings.get.useQuery({ key: "homepage_magazine_featured" });
  const featuredIssueLabel = (() => {
    try { return featuredSetting?.value ? JSON.parse(featuredSetting.value).issueLabel : null; } catch { return null; }
  })();

  const setFeaturedMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Magazine vedette mis à jour sur la page d'accueil");
      utils.admin.settings.get.invalidate({ key: "homepage_magazine_featured" });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const setAsFeatured = (issue: MagazineIssue) => {
    const payload = {
      issueId: issue.id,
      issueLabel: `${issue.issueNumber} — ${issue.title}`,
      coverUrl: issue.coverUrl ?? "",
      pdfUrl: issue.pdfUrl ?? "",
      pdfLabel: `${issue.pageCount ? `${issue.pageCount} pages — ` : ""}${issue.isPremium ? "Premium" : "Gratuit"}`,
      isFree: !issue.isPremium,
    };
    setFeaturedMutation.mutate({ key: "homepage_magazine_featured", value: JSON.stringify(payload) });
  };

  const createMutation = trpc.admin.magazineIssues.create.useMutation({
    onSuccess: () => {
      toast.success("Numéro créé avec succès");
      utils.admin.magazineIssues.list.invalidate();
      closeForm();
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const updateMutation = trpc.admin.magazineIssues.update.useMutation({
    onSuccess: () => {
      toast.success("Numéro mis à jour");
      utils.admin.magazineIssues.list.invalidate();
      closeForm();
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const deleteMutation = trpc.admin.magazineIssues.delete.useMutation({
    onSuccess: () => {
      toast.success("Numéro supprimé");
      utils.admin.magazineIssues.list.invalidate();
      setDeleteId(null);
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const togglePublishMutation = trpc.admin.magazineIssues.update.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      utils.admin.magazineIssues.list.invalidate();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (issue: MagazineIssue) => {
    setForm({
      issueNumber: issue.issueNumber,
      title: issue.title,
      description: issue.description || "",
      coverUrl: issue.coverUrl || "",
      pdfUrl: issue.pdfUrl || "",
      pdfFileKey: issue.pdfFileKey || "",
      coverFileKey: issue.coverFileKey || "",
      pageCount: issue.pageCount || undefined,
      isPremium: issue.isPremium,
      isPublished: issue.isPublished,
      sommaire: issue.sommaire || "",
    });
    setEditingId(issue.id);
    setFormOpen(true);
  };

  const handleUploadFile = async (file: File, type: "pdf") => {
    const setter = setUploadingPdf;
    setter(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/magazine", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload échoué");

      const result = await response.json();

      setForm((prev) => ({
        ...prev,
        pdfUrl: result.url,
        pdfFileKey: result.key,
      }));
      toast.success("PDF uploadé avec succès");
    } catch {
      toast.error(`Erreur lors de l'upload du ${type === "pdf" ? "PDF" : "fichier"}`);
    } finally {
      setter(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title) {
      toast.error("Le titre est requis");
      return;
    }

    const payload = {
      issueNumber: form.issueNumber,
      title: form.title,
      description: form.description || undefined,
      coverUrl: form.coverUrl || undefined,
      pdfUrl: form.pdfUrl || undefined,
      pdfFileKey: form.pdfFileKey || undefined,
      coverFileKey: form.coverFileKey || undefined,
      pageCount: form.pageCount || undefined,
      isPremium: form.isPremium,
      isPublished: form.isPublished,
      sommaire: form.sommaire || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Magazine PDF</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">
              Gérez les numéros du magazine Habari disponibles au téléchargement
            </p>
          </div>
          <Button onClick={openCreate} className="font-sans bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Nouveau numéro
          </Button>
        </div>

        {/* Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-16 w-12 bg-muted rounded" />
                  <div className="h-5 flex-1 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : !issues || issues.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-sans">Aucun numéro de magazine</p>
              <Button onClick={openCreate} variant="outline" className="mt-4 font-sans">
                <Plus className="w-4 h-4 mr-2" /> Créer le premier numéro
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Couverture</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Numéro / Titre</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Accès</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Téléchargements</th>
                    <th className="text-right px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue: MagazineIssue) => (
                    <tr key={issue.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        {issue.coverUrl ? (
                          <img src={issue.coverUrl} alt={issue.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-sans font-medium text-foreground text-sm">{issue.issueNumber}</p>
                            {featuredIssueLabel === `${issue.issueNumber} — ${issue.title}` && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold bg-yellow-100 text-yellow-700">
                                <Star className="w-2.5 h-2.5" /> Accueil
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{issue.title}</p>
                          {issue.pageCount && (
                            <p className="text-xs text-muted-foreground mt-0.5">{issue.pageCount} pages</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-sans font-medium ${
                          issue.isPremium
                            ? "bg-[oklch(0.75_0.15_85)]/20 text-[oklch(0.45_0.15_85)]"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {issue.isPremium ? "Premium" : "Gratuit"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-sans font-medium ${
                          issue.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {issue.isPublished ? "Publié" : "Brouillon"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                          <Download className="w-3.5 h-3.5" />
                          <span>{issue.downloadCount ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setAsFeatured(issue)}
                            disabled={setFeaturedMutation.isPending}
                            className={`p-1.5 rounded-md transition-colors ${
                              featuredIssueLabel === `${issue.issueNumber} — ${issue.title}`
                                ? "bg-yellow-100 text-yellow-600"
                                : "hover:bg-yellow-50 text-muted-foreground hover:text-yellow-500"
                            }`}
                            title="Mettre en vedette sur l'accueil"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePublishMutation.mutate({ id: issue.id, isPublished: !issue.isPublished })}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            title={issue.isPublished ? "Dépublier" : "Publier"}
                          >
                            {issue.isPublished ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(issue)}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(issue.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingId ? "Modifier le numéro" : "Nouveau numéro du magazine"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Issue number + Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {editingId && (
                <div>
                  <label className="block text-sm font-sans font-medium text-foreground mb-1.5">
                    Numéro
                  </label>
                  <div className="w-full px-3 py-2 border border-border rounded-lg text-sm font-sans bg-muted text-muted-foreground">
                    {form.issueNumber}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">
                  Nombre de pages
                </label>
                <input
                  type="number"
                  value={form.pageCount || ""}
                  onChange={(e) => setForm({ ...form, pageCount: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="67"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm font-sans bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Panne sèche à la CEMAC"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-sans bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description du numéro..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-sans bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">
                Sommaire
              </label>
              <textarea
                value={form.sommaire}
                onChange={(e) => setForm({ ...form, sommaire: e.target.value })}
                placeholder="Éditorial · Dossier central · Interview · ..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-sans bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">
                Fichier PDF
              </label>
              {form.pdfUrl ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="text-sm font-sans text-green-800 truncate flex-1">PDF uploadé</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, pdfUrl: "", pdfFileKey: "" })}
                    className="p-1 rounded hover:bg-green-100"
                    title="Supprimer le PDF"
                  >
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    aria-label="Sélectionner un fichier PDF"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadFile(file, "pdf");
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="font-sans"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingPdf ? "Upload en cours..." : "Uploader le PDF"}
                  </Button>
                </div>
              )}
            </div>

            {/* Cover Upload */}
            <ImagePickerWithAI
              label="Image de couverture"
              value={form.coverUrl}
              onChange={(url) => setForm({ ...form, coverUrl: url, coverFileKey: "" })}
              folder="magazine-covers"
              uploadEndpoint="/api/upload/magazine"
              aiPromptContext={`Professional magazine cover for issue titled: "${form.title || form.issueNumber}". ${form.description || ""}`}
              previewHeight="h-40"
            />

            {/* Options */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPremium}
                  onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-sm font-sans text-foreground">Contenu Premium</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-sm font-sans text-foreground">Publier immédiatement</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={closeForm} className="font-sans">
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="font-sans bg-primary hover:bg-primary/90"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Enregistrement..."
                  : editingId
                  ? "Mettre à jour"
                  : "Créer le numéro"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Supprimer ce numéro ?</AlertDialogTitle>
            <AlertDialogDescription className="font-sans">
              Cette action est irréversible. Le numéro sera définitivement supprimé. Les fichiers PDF et couverture resteront sur le CDN.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-600 hover:bg-red-700 font-sans"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
