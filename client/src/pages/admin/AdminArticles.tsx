import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { useState } from "react";
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

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-600",
};

const tierLabels: Record<string, string> = {
  free: "Libre",
  premium: "Premium",
  integral: "Intégral",
};

const tierColors: Record<string, string> = {
  free: "bg-blue-100 text-blue-800",
  premium: "bg-[oklch(0.75_0.15_85)]/20 text-[oklch(0.45_0.15_85)]",
  integral: "bg-primary/10 text-primary",
};

export default function AdminArticles() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: articles, isLoading } = trpc.admin.articles.list.useQuery({
    limit: 50,
    offset: 0,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const deleteMutation = trpc.admin.articles.delete.useMutation({
    onSuccess: () => {
      toast.success("Article supprimé avec succès");
      utils.admin.articles.list.invalidate();
      utils.admin.stats.invalidate();
      setDeleteId(null);
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const togglePublishMutation = trpc.admin.articles.update.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      utils.admin.articles.list.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const handleTogglePublish = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    togglePublishMutation.mutate({ id, status: newStatus });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Articles</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">
              Gérez les articles de la plateforme Habari
            </p>
          </div>
          <Link href="/admin/articles/nouveau">
            <Button className="font-sans bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Nouvel article
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {["all", "draft", "published", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-background border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {status === "all" ? "Tous" : statusLabels[status]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-5 flex-1 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                  <div className="h-5 w-24 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-sans">Aucun article trouvé</p>
              <Link href="/admin/articles/nouveau">
                <Button variant="outline" className="mt-4 font-sans">
                  <Plus className="w-4 h-4 mr-2" /> Créer le premier article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Titre</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Accès</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-sans font-medium text-foreground text-sm line-clamp-1">{article.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{article.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-sans font-medium ${statusColors[article.status]}`}>
                          {statusLabels[article.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-sans font-medium ${tierColors[article.minSubscriptionTier]}`}>
                          {tierLabels[article.minSubscriptionTier]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground font-sans">
                          {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString("fr-FR") : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleTogglePublish(article.id, article.status)}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            title={article.status === "published" ? "Dépublier" : "Publier"}
                          >
                            {article.status === "published" ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          <Link href={`/admin/articles/${article.id}`}>
                            <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Modifier">
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteId(article.id)}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription className="font-sans">
              Cette action est irréversible. L'article sera définitivement supprimé de la plateforme.
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
