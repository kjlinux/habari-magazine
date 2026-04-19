import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2, CalendarDays, X } from "lucide-react";
import ImagePickerWithAI from "@/components/ImagePickerWithAI";

type EventForm = {
  title: string;
  slug: string;
  description: string;
  type: 'conference' | 'webinar' | 'training' | 'workshop' | 'networking';
  startDate: string;
  endDate: string;
  location: string;
  image: string;
  capacity: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isExclusive: boolean;
};

const empty: EventForm = {
  title: "", slug: "", description: "", type: "conference",
  startDate: "", endDate: "", location: "", image: "", capacity: "", status: "upcoming", isExclusive: false,
};

const EVENT_TYPES = [
  { value: "conference", label: "Conférence" },
  { value: "webinar", label: "Webinaire" },
  { value: "training", label: "Formation" },
  { value: "workshop", label: "Atelier" },
  { value: "networking", label: "Networking" },
];

const EVENT_STATUSES = [
  { value: "upcoming", label: "À venir" },
  { value: "ongoing", label: "En cours" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminEvents() {
  const { data: evts, isLoading, refetch } = trpc.admin.events.list.useQuery();
  const createMutation = trpc.admin.events.create.useMutation({
    onSuccess: () => { toast.success("Événement créé"); refetch(); setShowForm(false); setForm(empty); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.admin.events.update.useMutation({
    onSuccess: () => { toast.success("Mis à jour"); refetch(); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.events.delete.useMutation({
    onSuccess: () => { toast.success("Supprimé"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventForm>(empty);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EventForm>(empty);

  const setF = (k: keyof EventForm, v: string | boolean) => setForm(p => ({
    ...p,
    [k]: v,
    ...(k === "title" && typeof v === "string" ? { slug: slugify(v) } : {}),
  }));

  const handleCreate = () => {
    if (!form.title.trim() || !form.startDate) { toast.error("Titre et date de début requis"); return; }
    createMutation.mutate({
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description || undefined,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      location: form.location || undefined,
      image: form.image || undefined,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
      status: form.status,
      isExclusive: form.isExclusive,
    });
  };

  const startEdit = (e: any) => {
    setEditingId(e.id);
    setEditForm({
      title: e.title, slug: e.slug, description: e.description || "",
      type: e.type, startDate: e.startDate?.slice(0, 10) || "",
      endDate: e.endDate?.slice(0, 10) || "", location: e.location || "",
      image: e.image || "", capacity: e.capacity?.toString() || "", status: e.status,
      isExclusive: !!e.isExclusive,
    });
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({
      id,
      title: editForm.title || undefined,
      slug: editForm.slug || undefined,
      description: editForm.description || null,
      type: editForm.type,
      startDate: editForm.startDate || undefined,
      endDate: editForm.endDate || null,
      location: editForm.location || null,
      image: editForm.image || null,
      capacity: editForm.capacity ? parseInt(editForm.capacity) : null,
      status: editForm.status,
      isExclusive: editForm.isExclusive,
    });
  };

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-700",
      ongoing: "bg-green-100 text-green-700",
      completed: "bg-muted text-muted-foreground",
      cancelled: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = { upcoming: "À venir", ongoing: "En cours", completed: "Terminé", cancelled: "Annulé" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${colors[s] ?? ""}`}>{labels[s] ?? s}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Événements</h1>
            <p className="text-sm text-muted-foreground font-sans mt-1">Gérez les conférences, webinaires et formations</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="font-sans gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Annuler" : "Nouvel événement"}
          </Button>
        </div>

        {showForm && (
          <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-serif font-bold text-lg mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" /> Créer un événement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <Label className="font-sans text-xs">Titre *</Label>
                <Input placeholder="Forum Économique de Brazzaville" value={form.title} onChange={e => setF("title", e.target.value)} className="font-sans text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="font-sans text-xs">Slug (URL)</Label>
                <Input value={form.slug} onChange={e => setF("slug", e.target.value)} className="font-sans text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="font-sans text-xs">Type</Label>
                <select value={form.type} onChange={e => setF("type", e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background" title="Type d'événement">
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="font-sans text-xs">Date de début *</Label>
                <Input type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)} className="font-sans text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="font-sans text-xs">Date de fin</Label>
                <Input type="date" value={form.endDate} onChange={e => setF("endDate", e.target.value)} className="font-sans text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="font-sans text-xs">Lieu</Label>
                <Input placeholder="Kinshasa, RDC" value={form.location} onChange={e => setF("location", e.target.value)} className="font-sans text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="font-sans text-xs">Capacité</Label>
                <Input type="number" placeholder="200" value={form.capacity} onChange={e => setF("capacity", e.target.value)} className="font-sans text-sm" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <ImagePickerWithAI
                  label="Image"
                  value={form.image}
                  onChange={(url) => setF("image", url)}
                  folder="events"
                  uploadEndpoint="/api/upload/image"
                  aiPromptContext={`Event image for: "${form.title || ""}"`}
                  previewHeight="h-40"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-sans text-xs">Statut</Label>
                <select value={form.status} onChange={e => setF("status", e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background" title="Statut">
                  {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="font-sans text-xs">Description</Label>
                <textarea placeholder="Description de l'événement..." value={form.description} onChange={e => setF("description", e.target.value)} rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background resize-none" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                <input
                  id="isExclusive"
                  type="checkbox"
                  title="Événement exclusif Intégral"
                  checked={form.isExclusive}
                  onChange={e => setF("isExclusive", e.target.checked)}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <Label htmlFor="isExclusive" className="font-sans text-sm cursor-pointer">
                  Événement exclusif (réservé aux abonnés Habari Intégral)
                </Label>
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
          ) : !evts || evts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground font-sans text-sm">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-20" />
              Aucun événement. Créez le premier.
            </div>
          ) : (
            <table className="w-full text-sm font-sans">
              <thead className="border-b border-border bg-muted/30">
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evts.map((e) => (
                  editingId === e.id ? (
                    <tr key={e.id} className="bg-primary/5">
                      <td className="px-4 py-2"><Input value={editForm.title} onChange={ev => setEditForm(p => ({ ...p, title: ev.target.value }))} className="font-sans text-sm h-8" /></td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <select value={editForm.type} onChange={ev => setEditForm(p => ({ ...p, type: ev.target.value as any }))} className="border border-input rounded px-2 py-1 text-sm font-sans bg-background" title="Type">
                          {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell"><Input type="date" value={editForm.startDate} onChange={ev => setEditForm(p => ({ ...p, startDate: ev.target.value }))} className="font-sans text-sm h-8" /></td>
                      <td className="px-4 py-2">
                        <select value={editForm.status} onChange={ev => setEditForm(p => ({ ...p, status: ev.target.value as any }))} className="border border-input rounded px-2 py-1 text-sm font-sans bg-background" title="Statut">
                          {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleUpdate(e.id)} disabled={updateMutation.isPending} className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700">OK</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 p-0"><X className="w-3 h-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{e.title}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground capitalize">{EVENT_TYPES.find(t => t.value === e.type)?.label ?? e.type}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{e.startDate ? new Date(e.startDate).toLocaleDateString("fr-FR") : "—"}</td>
                      <td className="px-4 py-3">{statusBadge(e.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(e)} className="h-7 w-7 p-0 hover:bg-primary/10"><Pencil className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: e.id })} disabled={deleteMutation.isPending} className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3 h-3" /></Button>
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
