import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Search, Pencil, Trash2, Loader2, AlertCircle,
  Filter, ChevronDown, TrendingUp, DollarSign,
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

type InvestmentType = "equity" | "debt" | "grant" | "partnership";
type InvestmentStatus = "open" | "closed" | "funded";

const typeLabels: Record<InvestmentType, { label: string; color: string }> = {
  equity: { label: "Fonds propres", color: "bg-blue-50 text-blue-700 border-blue-200" },
  debt: { label: "Dette", color: "bg-purple-50 text-purple-700 border-purple-200" },
  grant: { label: "Subvention", color: "bg-green-50 text-green-700 border-green-200" },
  partnership: { label: "Partenariat", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const statusLabels: Record<InvestmentStatus, { label: string; color: string }> = {
  open: { label: "Ouvert", color: "bg-green-50 text-green-700" },
  closed: { label: "Fermé", color: "bg-red-50 text-red-700" },
  funded: { label: "Financé", color: "bg-blue-50 text-blue-700" },
};

export default function AdminInvestments() {
  const [typeFilter, setTypeFilter] = useState<InvestmentType | undefined>();
  const [statusFilter, setStatusFilter] = useState<InvestmentStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.admin.investments.list.useQuery({
    investmentType: typeFilter,
    status: statusFilter,
    search: searchQuery.trim() || undefined,
    limit: 100,
  });

  const { data: counts } = trpc.admin.investments.counts.useQuery();

  const deleteMutation = trpc.admin.investments.delete.useMutation({
    onSuccess: () => { toast.success("Investissement supprimé"); refetch(); setDeleteId(null); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Opportunités d'investissement</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">
              Gérez les deals et levées de fonds
            </p>
          </div>
          <Link href="/admin/investisseurs/nouveau">
            <Button className="font-sans gap-2"><Plus className="w-4 h-4" /> Nouvel investissement</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif">{counts?.total ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Total</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-green-600">{counts?.open ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Ouverts</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-blue-600">{counts?.funded ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Financés</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-red-600">{counts?.closed ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Fermés</p>
          </div>
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
              <Button variant="outline" className="font-sans gap-2 min-w-[160px] justify-between">
                <span className="flex items-center gap-2"><Filter className="w-4 h-4" />
                  {typeFilter ? typeLabels[typeFilter].label : "Tous les types"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setTypeFilter(undefined)}>Tous les types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("equity")}>Fonds propres</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("debt")}>Dette</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("grant")}>Subvention</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter("partnership")}>Partenariat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-sans gap-2 min-w-[140px] justify-between">
                <span>{statusFilter ? statusLabels[statusFilter].label : "Tous statuts"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setStatusFilter(undefined)}>Tous statuts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("open")}>Ouvert</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("funded")}>Financé</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("closed")}>Fermé</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground font-sans">{total} résultat{total !== 1 ? "s" : ""}</p>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-background border border-border rounded-xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans mb-4">Aucun investissement trouvé</p>
            <Link href="/admin/investisseurs/nouveau">
              <Button className="font-sans gap-2"><Plus className="w-4 h-4" /> Créer un investissement</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any) => {
              const typeInfo = typeLabels[item.investmentType as InvestmentType] ?? typeLabels.equity;
              const statusInfo = statusLabels[item.status as InvestmentStatus] ?? statusLabels.open;
              return (
                <Card key={item.id} className="border shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-sans font-medium px-2 py-0.5 rounded border ${typeInfo.color}`}>
                            <TrendingUp className="w-3 h-3" /> {typeInfo.label}
                          </span>
                          <span className={`text-xs font-sans px-2 py-0.5 rounded ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-foreground truncate">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground font-sans mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-sans flex-wrap">
                          {item.targetAmount && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <DollarSign className="w-3 h-3" /> {item.targetAmount} {item.currency}
                            </span>
                          )}
                          {item.sector && <span>{item.sector}</span>}
                          {item.timeline && <span>{item.timeline}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/admin/investisseurs/${item.id}`}>
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
