import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Search, Pencil, Trash2, Loader2, AlertCircle, Star, StarOff,
  Filter, ChevronDown, Megaphone, FileText, Sparkles, Eye, EyeOff,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type PartnerCategory = "communique" | "sponsored" | "report";

const categoryLabels: Record<PartnerCategory, { label: string; icon: any; color: string }> = {
  communique: { label: "Communiqué", icon: Megaphone, color: "bg-blue-50 text-blue-700 border-blue-200" },
  sponsored: { label: "Sponsorisé", icon: Sparkles, color: "bg-amber-50 text-amber-700 border-amber-200" },
  report: { label: "Rapport", icon: FileText, color: "bg-green-50 text-green-700 border-green-200" },
};

export default function AdminPartners() {
  const [categoryFilter, setCategoryFilter] = useState<PartnerCategory | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.admin.partners.list.useQuery({
    category: categoryFilter,
    search: searchQuery.trim() || undefined,
    limit: 100,
  });

  const deleteMutation = trpc.admin.partners.delete.useMutation({
    onSuccess: () => { toast.success("Partenaire supprimé"); refetch(); setDeleteId(null); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const toggleFeaturedMutation = trpc.admin.partners.toggleFeatured.useMutation({
    onSuccess: (result: any) => {
      toast.success(result?.featured ? "Mis en vedette" : "Retiré de la une");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Partenaires</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">
              Communiqués, articles sponsorisés et rapports partenaires
            </p>
          </div>
          <Link href="/admin/partenaires/nouveau">
            <Button className="font-sans gap-2"><Plus className="w-4 h-4" /> Nouveau contenu</Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par titre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-sans gap-2 min-w-[180px] justify-between">
                <span className="flex items-center gap-2"><Filter className="w-4 h-4" />
                  {categoryFilter ? categoryLabels[categoryFilter].label : "Toutes catégories"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setCategoryFilter(undefined)}>Toutes catégories</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("communique")}>
                <Megaphone className="w-4 h-4 mr-2" /> Communiqués
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("sponsored")}>
                <Sparkles className="w-4 h-4 mr-2" /> Sponsorisés
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter("report")}>
                <FileText className="w-4 h-4 mr-2" /> Rapports
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground font-sans">{total} résultat{total !== 1 ? "s" : ""}</p>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-background border border-border rounded-xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans mb-4">Aucun contenu partenaire</p>
            <Link href="/admin/partenaires/nouveau">
              <Button className="font-sans gap-2"><Plus className="w-4 h-4" /> Créer un contenu</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any) => {
              const catInfo = categoryLabels[item.category as PartnerCategory] ?? categoryLabels.communique;
              const CatIcon = catInfo.icon;
              return (
                <Card key={item.id} className={`border shadow-sm hover:shadow-md transition-all ${item.featured ? "ring-1 ring-[oklch(0.72_0.15_75)]/30" : ""}`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-sans font-medium px-2 py-0.5 rounded border ${catInfo.color}`}>
                            <CatIcon className="w-3 h-3" /> {catInfo.label}
                          </span>
                          {item.published ? (
                            <span className="inline-flex items-center gap-1 text-xs font-sans text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              <Eye className="w-3 h-3" /> Publié
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-sans text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              <EyeOff className="w-3 h-3" /> Masqué
                            </span>
                          )}
                          {item.featured && (
                            <span className="inline-flex items-center gap-1 text-xs font-sans font-bold text-[oklch(0.55_0.15_85)] bg-[oklch(0.92_0.08_85)] px-2 py-0.5 rounded">
                              <Star className="w-3 h-3 fill-current" /> À la une
                            </span>
                          )}
                          {item.tag && (
                            <span className="text-xs font-sans px-2 py-0.5 rounded bg-muted text-muted-foreground">{item.tag}</span>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-base text-foreground truncate">{item.title}</h3>
                        {item.source && <p className="text-sm text-muted-foreground font-sans mt-0.5">{item.source}</p>}
                        {item.excerpt && (
                          <p className="text-sm text-muted-foreground font-sans mt-1 line-clamp-2">{item.excerpt}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost" size="sm" className="h-8 w-8 p-0"
                          title={item.featured ? "Retirer de la une" : "Mettre à la une"}
                          onClick={() => toggleFeaturedMutation.mutate({ id: item.id })}
                        >
                          {item.featured ? <StarOff className="w-4 h-4 text-[oklch(0.55_0.15_85)]" /> : <Star className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <Link href={`/admin/partenaires/${item.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Modifier">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost" size="sm" className="h-8 w-8 p-0"
                          title="Supprimer" onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirmer la suppression</DialogTitle>
            <DialogDescription className="font-sans">Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="font-sans">Annuler</Button>
            <Button
              variant="destructive" className="font-sans"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
