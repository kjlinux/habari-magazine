import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";

type InvestmentType = "equity" | "debt" | "grant" | "partnership";
type InvestmentStatus = "open" | "closed" | "funded";
type Tier = "free" | "premium" | "integral";

const typeOptions: { value: InvestmentType; label: string }[] = [
  { value: "equity", label: "Fonds propres (Equity)" },
  { value: "debt", label: "Dette" },
  { value: "grant", label: "Subvention" },
  { value: "partnership", label: "Partenariat" },
];

const statusOptions: { value: InvestmentStatus; label: string }[] = [
  { value: "open", label: "Ouvert" },
  { value: "funded", label: "Financé" },
  { value: "closed", label: "Fermé" },
];

const tierOptions: { value: Tier; label: string }[] = [
  { value: "free", label: "Gratuit" },
  { value: "premium", label: "Premium" },
  { value: "integral", label: "Habari Intégral" },
];

const sectorOptions = [
  "Agriculture", "Énergie", "Finance", "Santé", "Technologie", "Transport",
  "Mines", "Environnement", "Télécommunications", "Industrie", "Autre",
];

interface FormData {
  title: string;
  description: string;
  sector: string;
  investmentType: InvestmentType;
  targetAmount: string;
  currency: string;
  minInvestment: string;
  expectedReturn: string;
  timeline: string;
  status: InvestmentStatus;
  image: string;
  minSubscriptionTier: Tier;
}

const defaultForm: FormData = {
  title: "",
  description: "",
  sector: "",
  investmentType: "equity",
  targetAmount: "",
  currency: "USD",
  minInvestment: "",
  expectedReturn: "",
  timeline: "",
  status: "open",
  image: "",
  minSubscriptionTier: "premium",
};

export default function AdminInvestmentForm() {
  const [, params] = useRoute("/admin/investisseurs/:id");
  const [, navigate] = useLocation();
  const isNew = params?.id === "nouveau";
  const editId = isNew ? null : params?.id ? parseInt(params.id) : null;

  const [form, setForm] = useState<FormData>(defaultForm);

  const { data: existing } = trpc.admin.investments.byId.useQuery(
    { id: editId! },
    { enabled: editId !== null }
  );

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || "",
        description: existing.description || "",
        sector: existing.sector || "",
        investmentType: (existing.investmentType as InvestmentType) || "equity",
        targetAmount: existing.targetAmount || "",
        currency: existing.currency || "USD",
        minInvestment: existing.minInvestment || "",
        expectedReturn: existing.expectedReturn || "",
        timeline: existing.timeline || "",
        status: (existing.status as InvestmentStatus) || "open",
        image: existing.image || "",
        minSubscriptionTier: (existing.minSubscriptionTier as Tier) || "premium",
      });
    }
  }, [existing]);

  const createMutation = trpc.admin.investments.create.useMutation({
    onSuccess: () => { toast.success("Investissement créé"); navigate("/admin/investisseurs"); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const updateMutation = trpc.admin.investments.update.useMutation({
    onSuccess: () => { toast.success("Investissement mis à jour"); navigate("/admin/investisseurs"); },
    onError: (err) => toast.error(err.message || "Erreur"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Titre et description obligatoires");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      sector: form.sector.trim() || undefined,
      investmentType: form.investmentType,
      targetAmount: form.targetAmount.trim() || undefined,
      currency: form.currency.trim() || undefined,
      minInvestment: form.minInvestment.trim() || undefined,
      expectedReturn: form.expectedReturn.trim() || undefined,
      timeline: form.timeline.trim() || undefined,
      status: form.status,
      image: form.image.trim() || undefined,
      minSubscriptionTier: form.minSubscriptionTier,
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/investisseurs")} className="font-sans gap-1">
            <ChevronLeft className="w-4 h-4" /> Retour
          </Button>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {editId !== null ? "Modifier l'investissement" : "Nouvel investissement"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="font-serif">Informations générales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Titre *</label>
                <input
                  type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Description *</label>
                <textarea
                  required value={form.description} rows={5}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Type *</label>
                  <select
                    value={form.investmentType}
                    onChange={(e) => setForm({ ...form, investmentType: e.target.value as InvestmentType })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  >
                    {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-serif">Financier</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Montant cible</label>
                  <input
                    type="text" value={form.targetAmount}
                    placeholder="1000000"
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Devise</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="XAF">XAF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Investissement min.</label>
                  <input
                    type="text" value={form.minInvestment}
                    onChange={(e) => setForm({ ...form, minInvestment: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Rendement attendu</label>
                  <input
                    type="text" value={form.expectedReturn}
                    placeholder="12% IRR"
                    onChange={(e) => setForm({ ...form, expectedReturn: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Timeline</label>
                  <input
                    type="text" value={form.timeline}
                    placeholder="5 ans"
                    onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-serif">Publication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Statut</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as InvestmentStatus })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  >
                    {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium mb-1">Abonnement minimum</label>
                  <select
                    value={form.minSubscriptionTier}
                    onChange={(e) => setForm({ ...form, minSubscriptionTier: e.target.value as Tier })}
                    className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                  >
                    {tierOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium mb-1">Image (URL)</label>
                <input
                  type="url" value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/investisseurs")} className="font-sans">
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
