import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import ImagePickerWithAI from "@/components/ImagePickerWithAI";

const sectorOptions = [
  "Agriculture", "Énergie", "Finance", "Santé", "Technologie", "Transport",
  "Mines", "Environnement", "Télécommunications", "Industrie", "Commerce",
  "Éducation", "Infrastructure", "Tourisme", "Autre",
];

interface FormData {
  name: string;
  description: string;
  sector: string;
  subsector: string;
  website: string;
  email: string;
  phone: string;
  logo: string;
  foundedYear: string;
  employees: string;
  verified: boolean;
}

const defaultForm: FormData = {
  name: "",
  description: "",
  sector: "",
  subsector: "",
  website: "",
  email: "",
  phone: "",
  logo: "",
  foundedYear: "",
  employees: "",
  verified: false,
};

export default function AdminDirectoryForm() {
  const [, params] = useRoute("/admin/annuaire/:id");
  const [, navigate] = useLocation();
  const isNew = params?.id === "nouveau";
  const editId = isNew ? null : params?.id ? parseInt(params.id) : null;

  const [form, setForm] = useState<FormData>(defaultForm);

  const { data: existing } = trpc.admin.directory.byId.useQuery(
    { id: editId! },
    { enabled: editId !== null }
  );

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "",
        description: existing.description || "",
        sector: existing.sector || "",
        subsector: existing.subsector || "",
        website: existing.website || "",
        email: existing.email || "",
        phone: existing.phone || "",
        logo: existing.logo || "",
        foundedYear: existing.foundedYear ? String(existing.foundedYear) : "",
        employees: existing.employees || "",
        verified: existing.verified ?? false,
      });
    }
  }, [existing]);

  const createMutation = trpc.admin.directory.create.useMutation({
    onSuccess: () => { toast.success("Acteur créé"); navigate("/admin/annuaire"); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const updateMutation = trpc.admin.directory.update.useMutation({
    onSuccess: () => { toast.success("Acteur mis à jour"); navigate("/admin/annuaire"); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sector: form.sector.trim() || undefined,
      subsector: form.subsector.trim() || undefined,
      website: form.website.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      logo: form.logo.trim() || undefined,
      foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
      employees: form.employees.trim() || undefined,
      verified: form.verified,
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/annuaire")} className="font-sans gap-1">
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {editId !== null ? "Modifier l'acteur" : "Nouvel acteur"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="font-serif">Informations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Nom *</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Description</label>
                <textarea
                  value={form.description} rows={4}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Secteur</label>
                  <select
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  >
                    <option value="">—</option>
                    {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Sous-secteur</label>
                  <input
                    type="text" value={form.subsector}
                    onChange={(e) => setForm({ ...form, subsector: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-serif">Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Site web</label>
                  <input
                    type="url" value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Email</label>
                  <input
                    type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Téléphone</label>
                  <input
                    type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <ImagePickerWithAI
                    label="Logo"
                    value={form.logo}
                    onChange={(url) => setForm({ ...form, logo: url })}
                    folder="directory-logos"
                    uploadEndpoint="/api/upload/image"
                    aiPromptContext={`Company logo for: "${form.name || ""}"`}
                    previewHeight="h-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-serif">Entreprise</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Année de création</label>
                  <input
                    type="number" value={form.foundedYear}
                    onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Employés</label>
                  <input
                    type="text" value={form.employees}
                    placeholder="1-10, 11-50, 51-200..."
                    onChange={(e) => setForm({ ...form, employees: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-sans">
                <input
                  type="checkbox" checked={form.verified}
                  onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                />
                Acteur vérifié
              </label>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/annuaire")} className="font-sans">
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
