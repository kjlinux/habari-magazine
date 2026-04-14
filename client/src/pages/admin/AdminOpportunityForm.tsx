import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronLeft, Save, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";

type OpportunityType = "bid" | "ami" | "job";
type OpportunityStatus = "active" | "closed" | "draft";

const typeOptions = [
  { value: "bid", label: "Appel d'offres" },
  { value: "ami", label: "AMI / Partenariat" },
  { value: "job", label: "Emploi / Stage" },
];

const statusOptions = [
  { value: "active", label: "Actif (publié)" },
  { value: "draft", label: "Brouillon" },
  { value: "closed", label: "Fermé" },
];

const sectorOptions = [
  "Infrastructure", "Santé", "Énergie", "Technologie", "Agriculture",
  "Environnement", "Finance", "Éducation", "Transport", "Mines",
  "Télécommunications", "Industrie", "Commerce", "Tourisme", "Autre",
];

const countryOptions = [
  "Cameroun", "Gabon", "Congo", "Tchad", "Centrafrique", "Guinée équatoriale",
  "Angola", "Burundi", "RDC", "Rwanda", "São Tomé-et-Príncipe",
  "Régional CEEAC", "Régional", "Niger", "International",
];

const amiTypeOptions = [
  "AMI", "Appel à projets", "Appel à candidatures", "PPP", "Partenariat",
];

const contractTypeOptions = [
  "CDI", "CDD", "CDD 2 ans", "Stage 6 mois", "Stage 3 mois",
  "Mission 12 mois", "Mission 6 mois", "Consultant", "Freelance",
];

const experienceLevelOptions = [
  "Étudiant", "Junior", "Junior/Confirmé", "Confirmé", "Senior", "Directeur", "Expert",
];

interface FormData {
  type: OpportunityType;
  title: string;
  organization: string;
  country: string;
  sector: string;
  description: string;
  budget: string;
  currency: string;
  deadline: string;
  amiType: string;
  partners: string;
  webinaire: string;
  externalLink: string;
  contractType: string;
  experienceLevel: string;
  featured: boolean;
  status: OpportunityStatus;
}

const defaultForm: FormData = {
  type: "bid",
  title: "",
  organization: "",
  country: "",
  sector: "",
  description: "",
  budget: "",
  currency: "USD",
  deadline: "",
  amiType: "",
  partners: "",
  webinaire: "",
  externalLink: "",
  contractType: "",
  experienceLevel: "",
  featured: false,
  status: "active",
};

export default function AdminOpportunityForm() {
  const [, params] = useRoute("/admin/opportunites/:id");
  const [, navigate] = useLocation();
  const isNew = params?.id === "nouveau";
  const editId = isNew ? null : params?.id ? parseInt(params.id) : null;

  const [form, setForm] = useState<FormData>(defaultForm);

  const { data: existing, isLoading: loadingExisting } = trpc.admin.opportunities.byId.useQuery(
    { id: editId! },
    { enabled: editId !== null }
  );

  useEffect(() => {
    if (existing) {
      setForm({
        type: (existing.type as OpportunityType) || "bid",
        title: existing.title || "",
        organization: existing.organization || "",
        country: existing.country || "",
        sector: existing.sector || "",
        description: existing.description || "",
        budget: existing.budget || "",
        currency: existing.currency || "USD",
        deadline: existing.deadline || "",
        amiType: existing.amiType || "",
        partners: existing.partners || "",
        webinaire: existing.webinaire || "",
        externalLink: existing.externalLink || "",
        contractType: existing.contractType || "",
        experienceLevel: existing.experienceLevel || "",
        featured: existing.featured ?? false,
        status: (existing.status as OpportunityStatus) || "active",
      });
    }
  }, [existing]);

  const createMutation = trpc.admin.opportunities.create.useMutation({
    onSuccess: () => {
      toast.success("Annonce créée avec succès");
      navigate("/admin/opportunites");
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la création"),
  });

  const updateMutation = trpc.admin.opportunities.update.useMutation({
    onSuccess: () => {
      toast.success("Annonce mise à jour");
      navigate("/admin/opportunites");
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la mise à jour"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.organization.trim() || !form.country.trim()) {
      toast.error("Le titre, l'organisme et le pays sont obligatoires");
      return;
    }

    const payload = {
      type: form.type,
      title: form.title.trim(),
      organization: form.organization.trim(),
      country: form.country.trim(),
      sector: form.sector || undefined,
      description: form.description || undefined,
      budget: form.budget || undefined,
      currency: form.currency || undefined,
      deadline: form.deadline || undefined,
      amiType: form.type === "ami" ? (form.amiType || undefined) : undefined,
      partners: form.type === "ami" ? (form.partners || undefined) : undefined,
      webinaire: form.type === "ami" ? (form.webinaire || undefined) : undefined,
      externalLink: form.externalLink || undefined,
      contractType: form.type === "job" ? (form.contractType || undefined) : undefined,
      experienceLevel: form.type === "job" ? (form.experienceLevel || undefined) : undefined,
      featured: form.featured,
      status: form.status,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (editId && loadingExisting) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/opportunites")} className="font-sans gap-1">
              <ChevronLeft className="w-4 h-4" /> Retour
            </Button>
            <h1 className="text-xl font-serif font-bold text-foreground">
              {isNew ? "Nouvelle annonce" : "Modifier l'annonce"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSaving} className="font-sans gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isNew ? "Publier" : "Enregistrer"}
            </Button>
          </div>
        </div>

        {/* Type & Status */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-base">Type et statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Type d'annonce *</label>
                <select
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value as OpportunityType)}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value as OpportunityStatus)}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => updateField("featured", e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <label htmlFor="featured" className="text-sm font-sans text-foreground">
                Mettre en vedette (« À la une »)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Informations principales */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-base">Informations principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Titre *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Ex: Construction d'un pont sur la Sanaga"
                className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Organisme / Entreprise *</label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => updateField("organization", e.target.value)}
                  placeholder="Ex: Ministère des Travaux Publics"
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Pays *</label>
                <select
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Sélectionner un pays</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Secteur</label>
                <select
                  value={form.sector}
                  onChange={(e) => updateField("sector", e.target.value)}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Sélectionner un secteur</option>
                  {sectorOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Date limite</label>
                <input
                  type="text"
                  value={form.deadline}
                  onChange={(e) => updateField("deadline", e.target.value)}
                  placeholder="Ex: 15 mars 2026"
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={5}
                placeholder="Description détaillée de l'annonce..."
                className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Lien externe</label>
              <input
                type="url"
                value={form.externalLink}
                onChange={(e) => updateField("externalLink", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget (bid & ami) */}
        {(form.type === "bid" || form.type === "ami") && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-base">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Montant</label>
                  <input
                    type="text"
                    value={form.budget}
                    onChange={(e) => updateField("budget", e.target.value)}
                    placeholder="Ex: 12M ou 500 000"
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Devise</label>
                  <select
                    value={form.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="XAF">XAF (FCFA)</option>
                    <option value="CDF">CDF</option>
                    <option value="RWF">RWF</option>
                    <option value="BIF">BIF</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AMI-specific fields */}
        {form.type === "ami" && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-base">Détails AMI / Partenariat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Type d'AMI</label>
                <select
                  value={form.amiType}
                  onChange={(e) => updateField("amiType", e.target.value)}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Sélectionner</option>
                  {amiTypeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Partenaires</label>
                <input
                  type="text"
                  value={form.partners}
                  onChange={(e) => updateField("partners", e.target.value)}
                  placeholder="Ex: GEAPP, GreenMax Capital Group, Banque Mondiale"
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Webinaire</label>
                <input
                  type="text"
                  value={form.webinaire}
                  onChange={(e) => updateField("webinaire", e.target.value)}
                  placeholder="Ex: 17 mars 2026 — 10h30-12h30 (UTC+1)"
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job-specific fields */}
        {form.type === "job" && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-base">Détails Emploi / Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Type de contrat</label>
                  <select
                    value={form.contractType}
                    onChange={(e) => updateField("contractType", e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Sélectionner</option>
                    {contractTypeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-foreground mb-1.5">Niveau d'expérience</label>
                  <select
                    value={form.experienceLevel}
                    onChange={(e) => updateField("experienceLevel", e.target.value)}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Sélectionner</option>
                    {experienceLevelOptions.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/opportunites")} className="font-sans">
            Annuler
          </Button>
          <Button type="submit" disabled={isSaving} className="font-sans gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? "Créer l'annonce" : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
