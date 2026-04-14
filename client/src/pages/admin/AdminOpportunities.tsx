import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText, Handshake, Briefcase, Plus, Search, Star, StarOff,
  Pencil, Trash2, Loader2, Filter, ChevronDown, ExternalLink,
  MapPin, Calendar, AlertCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type OpportunityType = "bid" | "ami" | "job";
type OpportunityStatus = "active" | "closed" | "draft";

const typeLabels: Record<OpportunityType, { label: string; icon: any; color: string }> = {
  bid: { label: "Appel d'offres", icon: FileText, color: "bg-green-50 text-green-700 border-green-200" },
  ami: { label: "AMI / Partenariat", icon: Handshake, color: "bg-blue-50 text-blue-700 border-blue-200" },
  job: { label: "Emploi / Stage", icon: Briefcase, color: "bg-purple-50 text-purple-700 border-purple-200" },
};

const statusLabels: Record<OpportunityStatus, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-green-50 text-green-700" },
  closed: { label: "Fermé", color: "bg-red-50 text-red-700" },
  draft: { label: "Brouillon", color: "bg-yellow-50 text-yellow-700" },
};

export default function AdminOpportunities() {
  const [typeFilter, setTypeFilter] = useState<OpportunityType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.admin.opportunities.list.useQuery({
    type: typeFilter,
    status: statusFilter,
    search: searchQuery.trim() || undefined,
    limit: 100,
  });

  const { data: counts } = trpc.admin.opportunities.counts.useQuery();

  const deleteMutation = trpc.admin.opportunities.delete.useMutation({
    onSuccess: () => {
      toast.success("Opportunité supprimée avec succès");
      refetch();
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la suppression");
    },
  });

  const toggleFeaturedMutation = trpc.admin.opportunities.toggleFeatured.useMutation({
    onSuccess: (result) => {
      toast.success(result?.featured ? "Annonce mise en vedette" : "Annonce retirée de la une");
      refetch();
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Appels d'offres & Opportunités</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">
              Gérez les appels d'offres, AMI/partenariats et offres d'emploi
            </p>
          </div>
          <Link href="/admin/opportunites/nouveau">
            <Button className="font-sans gap-2">
              <Plus className="w-4 h-4" /> Nouvelle annonce
            </Button>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif">{counts?.total ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Total</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-green-600">{counts?.active ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Actifs</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-yellow-600">{counts?.draft ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Brouillons</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-red-600">{counts?.closed ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Fermés</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par titre ou organisme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Type filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-sans gap-2 min-w-[160px] justify-between">
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {typeFilter ? typeLabels[typeFilter].label : "Tous les types"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setTypeFilter(undefined)}>Tous les types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("bid")}>
                <FileText className="w-4 h-4 mr-2" /> Appels d'offres
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("ami")}>
                <Handshake className="w-4 h-4 mr-2" /> AMI / Partenariats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("job")}>
                <Briefcase className="w-4 h-4 mr-2" /> Emplois & Stages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-sans gap-2 min-w-[140px] justify-between">
                <span>{statusFilter ? statusLabels[statusFilter].label : "Tous statuts"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setStatusFilter(undefined)}>Tous statuts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>Actif</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Brouillon</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("closed")}>Fermé</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground font-sans">
          {total} résultat{total !== 1 ? "s" : ""}
        </p>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-background border border-border rounded-xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans mb-4">Aucune opportunité trouvée</p>
            <Link href="/admin/opportunites/nouveau">
              <Button className="font-sans gap-2">
                <Plus className="w-4 h-4" /> Créer une annonce
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const typeInfo = typeLabels[item.type as OpportunityType] ?? typeLabels.bid;
              const statusInfo = statusLabels[item.status as OpportunityStatus] ?? statusLabels.active;
              const TypeIcon = typeInfo.icon;

              return (
                <Card key={item.id} className={`border shadow-sm hover:shadow-md transition-all ${item.featured ? "ring-1 ring-[oklch(0.72_0.15_75)]/30 border-[oklch(0.72_0.15_75)]/40" : ""}`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-sans font-medium px-2 py-0.5 rounded border ${typeInfo.color}`}>
                            <TypeIcon className="w-3 h-3" /> {typeInfo.label}
                          </span>
                          <span className={`text-xs font-sans px-2 py-0.5 rounded ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          {item.featured && (
                            <span className="inline-flex items-center gap-1 text-xs font-sans font-bold text-[oklch(0.55_0.15_85)] bg-[oklch(0.92_0.08_85)] px-2 py-0.5 rounded">
                              <Star className="w-3 h-3 fill-current" /> À la une
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-base text-foreground truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground font-sans mt-0.5">{item.organization}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-sans">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.country}</span>
                          {item.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.deadline}</span>}
                          {item.sector && <span>{item.sector}</span>}
                          {item.budget && <span className="font-medium text-foreground">{item.budget} {item.currency}</span>}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title={item.featured ? "Retirer de la une" : "Mettre à la une"}
                          onClick={() => toggleFeaturedMutation.mutate({ id: item.id })}
                        >
                          {item.featured ? <StarOff className="w-4 h-4 text-[oklch(0.55_0.15_85)]" /> : <Star className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        {item.externalLink && (
                          <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Lien externe">
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </a>
                        )}
                        <Link href={`/admin/opportunites/${item.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Modifier">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Supprimer"
                          onClick={() => setDeleteId(item.id)}
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirmer la suppression</DialogTitle>
            <DialogDescription className="font-sans">
              Cette action est irréversible. L'annonce sera définitivement supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="font-sans">
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="font-sans"
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
