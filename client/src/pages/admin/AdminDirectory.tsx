import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Search, Pencil, Trash2, Loader2, AlertCircle,
  CheckCircle2, XCircle, Globe, Mail, Phone, MapPin
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.admin.directory.list.useQuery({
    search: searchQuery.trim() || undefined,
    limit: 100,
  });

  const { data: counts } = trpc.admin.directory.counts.useQuery();

  const deleteMutation = trpc.admin.directory.delete.useMutation({
    onSuccess: () => {
      toast.success("Acteur supprimé avec succès");
      refetch();
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la suppression"),
  });

  const toggleVerifiedMutation = trpc.admin.directory.toggleVerified.useMutation({
    onSuccess: (result: any) => {
      toast.success(result?.verified ? "Acteur vérifié" : "Acteur non vérifié");
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
            <h1 className="text-2xl font-serif font-bold text-foreground">Annuaire</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">
              Gérez les acteurs économiques de l'annuaire
            </p>
          </div>
          <Link href="/admin/annuaire/nouveau">
            <Button className="font-sans gap-2">
              <Plus className="w-4 h-4" /> Nouvel acteur
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif">{counts?.total ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Total</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-green-600">{counts?.verified ?? 0}</p>
            <p className="text-xs text-muted-foreground font-sans">Vérifiés</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <p className="text-sm text-muted-foreground font-sans">
          {total} résultat{total !== 1 ? "s" : ""}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-background border border-border rounded-xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans mb-4">Aucun acteur trouvé</p>
            <Link href="/admin/annuaire/nouveau">
              <Button className="font-sans gap-2"><Plus className="w-4 h-4" /> Créer un acteur</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any) => (
              <Card key={item.id} className="border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {item.sector && (
                          <span className="text-xs font-sans px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {item.sector}
                          </span>
                        )}
                        {item.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-sans text-green-700 bg-green-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-sans text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" /> Non vérifié
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base text-foreground truncate">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground font-sans mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-sans flex-wrap">
                        {item.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {item.website}</span>}
                        {item.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</span>}
                        {item.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</span>}
                        {item.employees && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.employees} employés</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost" size="sm" className="h-8 w-8 p-0"
                        title={item.verified ? "Retirer vérification" : "Vérifier"}
                        onClick={() => toggleVerifiedMutation.mutate({ id: item.id })}
                      >
                        {item.verified ? <XCircle className="w-4 h-4 text-muted-foreground" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </Button>
                      <Link href={`/admin/annuaire/${item.id}`}>
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
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirmer la suppression</DialogTitle>
            <DialogDescription className="font-sans">
              Cette action est irréversible. L'acteur sera définitivement supprimé.
            </DialogDescription>
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
