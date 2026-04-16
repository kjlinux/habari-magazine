import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2, Users, X, Check } from "lucide-react";

type AuthorForm = {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  specialization: string;
};

const empty: AuthorForm = { name: "", email: "", bio: "", avatar: "", specialization: "" };

export default function AdminAuthors() {
  const { data: authors, isLoading, refetch } = trpc.admin.authors.list.useQuery();
  const createMutation = trpc.admin.authors.create.useMutation({
    onSuccess: () => { toast.success("Auteur créé"); refetch(); setShowForm(false); setForm(empty); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.admin.authors.update.useMutation({
    onSuccess: () => { toast.success("Auteur mis à jour"); refetch(); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.authors.delete.useMutation({
    onSuccess: () => { toast.success("Auteur supprimé"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AuthorForm>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<AuthorForm>(empty);

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Le nom est requis"); return; }
    createMutation.mutate({
      name: form.name,
      email: form.email || undefined,
      bio: form.bio || undefined,
      avatar: form.avatar || undefined,
      specialization: form.specialization || undefined,
    });
  };

  const startEdit = (a: AuthorForm & { id: number }) => {
    setEditingId(a.id);
    setEditForm({ name: a.name, email: a.email || "", bio: a.bio || "", avatar: a.avatar || "", specialization: a.specialization || "" });
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({
      id,
      name: editForm.name || undefined,
      email: editForm.email || null,
      bio: editForm.bio || null,
      avatar: editForm.avatar || null,
      specialization: editForm.specialization || null,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Auteurs</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">Gérez les auteurs et contributeurs du magazine</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="font-sans gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Annuler" : "Nouvel auteur"}
          </Button>
        </div>

        {showForm && (
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-serif font-bold text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Nouvel auteur</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Nom *", placeholder: "Jean Dupont" },
                { key: "email", label: "Email", placeholder: "jean@habari.com" },
                { key: "specialization", label: "Spécialisation", placeholder: "Économie, Finance..." },
                { key: "avatar", label: "URL avatar", placeholder: "https://..." },
              ].map(f => (
                <div key={f.key} className="space-y-1">
                  <Label className="font-sans text-xs">{f.label}</Label>
                  <Input placeholder={f.placeholder} value={form[f.key as keyof AuthorForm]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="font-sans text-sm" />
                </div>
              ))}
              <div className="sm:col-span-2 space-y-1">
                <Label className="font-sans text-xs">Biographie</Label>
                <textarea placeholder="Courte biographie de l'auteur..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="font-sans bg-primary hover:bg-primary/90">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setForm(empty); }} className="font-sans">Annuler</Button>
            </div>
          </div>
        )}

        <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !authors || authors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground font-sans text-sm">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              Aucun auteur enregistré. Créez le premier.
            </div>
          ) : (
            <table className="w-full text-sm font-sans">
              <thead className="border-b border-border bg-muted/30">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 hidden md:table-cell">Spécialisation</th>
                  <th className="px-4 py-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {authors.map((a) => (
                  editingId === a.id ? (
                    <tr key={a.id} className="bg-primary/5">
                      <td className="px-4 py-2"><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="font-sans text-sm h-8" /></td>
                      <td className="px-4 py-2 hidden sm:table-cell"><Input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="font-sans text-sm h-8" /></td>
                      <td className="px-4 py-2 hidden md:table-cell"><Input value={editForm.specialization} onChange={e => setEditForm(p => ({ ...p, specialization: e.target.value }))} className="font-sans text-sm h-8" /></td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleUpdate(a.id)} disabled={updateMutation.isPending} className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"><Check className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 p-0"><X className="w-3 h-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{a.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{a.email || "—"}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{a.specialization || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(a as any)} className="h-7 w-7 p-0 hover:bg-primary/10"><Pencil className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: a.id })} disabled={deleteMutation.isPending} className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
