import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Pencil, Trash2, Loader2, AlertCircle,
  CheckCircle2, XCircle, Star, EyeOff, Eye, Clock
} from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Member = {
  id: number;
  name: string;
  role?: string | null;
  company?: string | null;
  country?: string | null;
  category?: string | null;
  bio?: string | null;
  avatar?: string | null;
  linkedin?: string | null;
  email?: string | null;
  verified: boolean | null;
  featured: boolean | null;
  published: boolean | null;
};

type FormState = Omit<Member, "id">;

const EMPTY_FORM: FormState = {
  name: "", role: "", company: "", country: "", category: "",
  bio: "", avatar: "", linkedin: "", email: "",
  verified: false, featured: false, published: true,
};

const CATEGORIES = ["Entrepreneurs", "Investisseurs", "Décideurs", "Consultants", "Startups", "ONG & Institutions"];

export default function AdminCommunity() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "published">("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: members = [], isLoading, refetch } = trpc.admin.community.list.useQuery({
    search: searchQuery.trim() || undefined,
    limit: 200,
  });

  const updateMutation = trpc.admin.community.update.useMutation({
    onSuccess: () => { toast.success("Membre mis à jour"); refetch(); setFormOpen(false); setEditingId(null); setForm(EMPTY_FORM); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const deleteMutation = trpc.admin.community.delete.useMutation({
    onSuccess: () => { toast.success("Membre supprimé"); refetch(); setDeleteId(null); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const toggleVerifiedMutation = trpc.admin.community.toggleVerified.useMutation({
    onSuccess: () => { refetch(); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const handleEdit = (member: Member) => {
    setEditingId(member.id);
    setForm({
      name: member.name, role: member.role ?? "", company: member.company ?? "",
      country: member.country ?? "", category: member.category ?? "",
      bio: member.bio ?? "", avatar: member.avatar ?? "",
      linkedin: member.linkedin ?? "", email: member.email ?? "",
      verified: member.verified ?? false, featured: member.featured ?? false,
      published: member.published ?? false,
    });
    setFormOpen(true);
  };

  const handlePublishToggle = (member: Member) => {
    updateMutation.mutate({ id: member.id, published: !member.published });
    toast.success(member.published ? "Membre masqué" : "Membre publié");
  };

  const handleSubmit = () => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, ...form });
  };

  const allMembers = members as Member[];
  const pending = allMembers.filter((m) => !m.published);
  const published = allMembers.filter((m) => m.published);

  const filtered = filterStatus === "pending" ? pending
    : filterStatus === "published" ? published
    : allMembers;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Communauté</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">
              Gérez les demandes et membres du réseau professionnel
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif">{allMembers.length}</p>
            <p className="text-xs text-muted-foreground font-sans">Total</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-orange-500">{pending.length}</p>
            <p className="text-xs text-muted-foreground font-sans">En attente</p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-2xl font-bold font-serif text-green-600">{published.length}</p>
            <p className="text-xs text-muted-foreground font-sans">Publiés</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "published"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${filterStatus === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {s === "all" ? "Tous" : s === "pending" ? `En attente (${pending.length})` : `Publiés (${published.length})`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom ou entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-background border border-border rounded-xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-sans">Aucun membre trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((member) => (
              <Card key={member.id} className="border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {!member.published && (
                          <span className="inline-flex items-center gap-1 text-xs font-sans text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            <Clock className="w-3 h-3" /> En attente de validation
                          </span>
                        )}
                        {member.published && (
                          <span className="inline-flex items-center gap-1 text-xs font-sans text-green-700 bg-green-50 px-2 py-0.5 rounded">
                            <Eye className="w-3 h-3" /> Publié
                          </span>
                        )}
                        {member.verified && (
                          <span className="inline-flex items-center gap-1 text-xs font-sans text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Vérifié
                          </span>
                        )}
                        {member.featured && (
                          <span className="inline-flex items-center gap-1 text-xs font-sans text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">
                            <Star className="w-3 h-3" /> En vedette
                          </span>
                        )}
                        {member.category && (
                          <span className="text-xs font-sans px-2 py-0.5 rounded bg-muted text-muted-foreground">{member.category}</span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base text-foreground">{member.name}</h3>
                      {(member.role || member.company) && (
                        <p className="text-sm text-muted-foreground font-sans">
                          {member.role}{member.company ? ` — ${member.company}` : ""}
                        </p>
                      )}
                      {member.country && <p className="text-xs text-muted-foreground font-sans mt-0.5">{member.country}</p>}
                      {member.bio && <p className="text-xs text-muted-foreground font-sans mt-1 line-clamp-2">{member.bio}</p>}
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground font-sans">
                        {member.email && <span>{member.email}</span>}
                        {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button" variant="ghost" size="sm" className="h-8 px-2 font-sans text-xs gap-1"
                        title={member.published ? "Masquer" : "Publier"}
                        onClick={() => handlePublishToggle(member)}
                        disabled={updateMutation.isPending}
                      >
                        {member.published
                          ? <><EyeOff className="w-4 h-4 text-muted-foreground" /><span className="hidden sm:inline">Masquer</span></>
                          : <><Eye className="w-4 h-4 text-green-600" /><span className="hidden sm:inline text-green-600">Publier</span></>
                        }
                      </Button>
                      <Button
                        type="button" variant="ghost" size="sm" className="h-8 w-8 p-0"
                        title={member.verified ? "Retirer vérification" : "Vérifier"}
                        onClick={() => toggleVerifiedMutation.mutate({ id: member.id })}
                      >
                        {member.verified
                          ? <XCircle className="w-4 h-4 text-muted-foreground" />
                          : <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        }
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Modifier" onClick={() => handleEdit(member)}>
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Supprimer" onClick={() => setDeleteId(member.id)}>
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

      {/* Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { setFormOpen(false); setEditingId(null); setForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Modifier le membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-sans font-medium">Nom *</label>
              <input aria-label="Nom" placeholder="Nom complet" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-sans font-medium">Fonction</label>
                <input aria-label="Fonction" placeholder="Ex: Directeur Général" value={form.role ?? ""} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-sans font-medium">Entreprise</label>
                <input aria-label="Entreprise" placeholder="Ex: Habari Group" value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-sans font-medium">Pays</label>
                <input aria-label="Pays" placeholder="Ex: Cameroun" value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-sm font-sans font-medium">Catégorie</label>
                <select aria-label="Catégorie" title="Catégorie" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Sélectionner —</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-sans font-medium">Bio</label>
              <textarea aria-label="Bio" placeholder="Présentation courte..." value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
                className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div>
              <label className="text-sm font-sans font-medium">Email</label>
              <input aria-label="Email" type="email" placeholder="contact@exemple.com" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-sans font-medium">LinkedIn URL</label>
              <input aria-label="LinkedIn URL" placeholder="https://linkedin.com/in/..." value={form.linkedin ?? ""} onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-sans cursor-pointer">
                <input type="checkbox" checked={form.verified ?? false} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
                Vérifié
              </label>
              <label className="flex items-center gap-2 text-sm font-sans cursor-pointer">
                <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                En vedette
              </label>
              <label className="flex items-center gap-2 text-sm font-sans cursor-pointer">
                <input type="checkbox" checked={form.published ?? false} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                Publié
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="font-sans">Annuler</Button>
            <Button type="button" onClick={handleSubmit} disabled={updateMutation.isPending || !form.name.trim()} className="font-sans">
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirmer la suppression</DialogTitle>
            <DialogDescription className="font-sans">Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)} className="font-sans">Annuler</Button>
            <Button type="button" variant="destructive" className="font-sans"
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
