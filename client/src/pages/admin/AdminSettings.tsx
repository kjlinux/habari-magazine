import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import {
  Settings,
  Tag,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  Share2,
  Calendar,
  CreditCard,
  Upload,
} from "lucide-react";
import { useRef } from "react";
import ImagePickerWithAI from "@/components/ImagePickerWithAI";

// ─── Prix PDF ───────────────────────────────────────────────────────────────

function PdfPriceSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Prix mis à jour");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const currentPrice =
    settings?.find(s => s.key === "magazine_pdf_price")?.value ?? "499";
  const [euros, setEuros] = useState<string>("");
  const [edited, setEdited] = useState(false);

  const displayPrice = edited
    ? euros
    : (parseInt(currentPrice) / 100).toFixed(2).replace(".", ",");

  const handleSave = () => {
    const val = parseFloat(euros.replace(",", "."));
    if (isNaN(val) || val <= 0) {
      toast.error("Prix invalide");
      return;
    }
    const cents = Math.round(val * 100);
    setMutation.mutate({ key: "magazine_pdf_price", value: cents.toString() });
    setEdited(false);
  };

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Settings className="w-5 h-5" /> Prix du magazine PDF à l'unité
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        Ce prix est appliqué lors de l'achat d'un numéro à l'unité via Stripe.
        Prix actuel en base :{" "}
        <strong>{(parseInt(currentPrice) / 100).toFixed(2)} €</strong>
      </p>
      <div className="flex items-end gap-3 max-w-xs">
        <div className="flex-1 space-y-1">
          <Label className="font-sans text-sm">Nouveau prix (€)</Label>
          <Input
            type="text"
            placeholder={displayPrice}
            value={edited ? euros : ""}
            onChange={e => {
              setEuros(e.target.value);
              setEdited(true);
            }}
            className="font-sans"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={!edited || setMutation.isPending}
          className="font-sans bg-primary hover:bg-primary/90"
        >
          {setMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Codes promo ────────────────────────────────────────────────────────────

type CreateForm = {
  name: string;
  type: "percent" | "amount";
  value: string;
  duration: "once" | "forever" | "repeating";
  durationInMonths: string;
  maxRedemptions: string;
  redeemBy: string;
};

function PromoCodeSettings() {
  const {
    data: codes,
    refetch,
    isLoading,
  } = trpc.admin.promoCodes.list.useQuery();
  const createMutation = trpc.admin.promoCodes.create.useMutation({
    onSuccess: () => {
      toast.success("Code promo créé");
      refetch();
      setShowForm(false);
      resetForm();
    },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.promoCodes.delete.useMutation({
    onSuccess: () => {
      toast.success("Code supprimé");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const emptyForm: CreateForm = {
    name: "",
    type: "percent",
    value: "",
    duration: "once",
    durationInMonths: "",
    maxRedemptions: "",
    redeemBy: "",
  };
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const resetForm = () => setForm(emptyForm);

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error("Nom requis");
      return;
    }
    const val = parseFloat(form.value.replace(",", "."));
    if (isNaN(val) || val <= 0) {
      toast.error("Valeur invalide");
      return;
    }
    createMutation.mutate({
      name: form.name,
      ...(form.type === "percent"
        ? { percentOff: val }
        : { amountOff: Math.round(val * 100) }),
      duration: form.duration,
      ...(form.duration === "repeating" && form.durationInMonths
        ? { durationInMonths: parseInt(form.durationInMonths) }
        : {}),
      ...(form.maxRedemptions
        ? { maxRedemptions: parseInt(form.maxRedemptions) }
        : {}),
      ...(form.redeemBy
        ? { redeemBy: new Date(form.redeemBy).toISOString() }
        : {}),
    });
  };

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
          <Tag className="w-5 h-5" /> Codes promotionnels
        </h2>
        <Button
          size="sm"
          onClick={() => setShowForm(v => !v)}
          className="font-sans gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau code
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border space-y-4">
          <h3 className="font-sans font-semibold text-sm">
            Créer un code promo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-sans text-xs">Nom du coupon</Label>
              <Input
                placeholder="EX: LANCEMENT20"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="font-sans text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">Type de réduction</Label>
              <select
                value={form.type}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    type: e.target.value as "percent" | "amount",
                  }))
                }
                className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background"
                title="Type de réduction"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="amount">Montant fixe (€)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">
                {form.type === "percent" ? "Réduction (%)" : "Montant (€)"}
              </Label>
              <Input
                placeholder={form.type === "percent" ? "20" : "2,00"}
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className="font-sans text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">Durée</Label>
              <select
                value={form.duration}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    duration: e.target.value as
                      | "once"
                      | "forever"
                      | "repeating",
                  }))
                }
                className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background"
                title="Durée"
              >
                <option value="once">Une seule fois</option>
                <option value="forever">Illimitée</option>
                <option value="repeating">Répétée (mois)</option>
              </select>
            </div>
            {form.duration === "repeating" && (
              <div className="space-y-1">
                <Label className="font-sans text-xs">Nombre de mois</Label>
                <Input
                  placeholder="3"
                  value={form.durationInMonths}
                  onChange={e =>
                    setForm(f => ({ ...f, durationInMonths: e.target.value }))
                  }
                  className="font-sans text-sm"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="font-sans text-xs">
                Utilisations max (optionnel)
              </Label>
              <Input
                placeholder="100"
                value={form.maxRedemptions}
                onChange={e =>
                  setForm(f => ({ ...f, maxRedemptions: e.target.value }))
                }
                className="font-sans text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">
                Date d'expiration (optionnel)
              </Label>
              <Input
                type="date"
                value={form.redeemBy}
                onChange={e =>
                  setForm(f => ({ ...f, redeemBy: e.target.value }))
                }
                className="font-sans text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="font-sans bg-primary hover:bg-primary/90"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Créer"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="font-sans"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !codes || codes.length === 0 ? (
        <p className="text-sm text-muted-foreground font-sans py-4 text-center">
          Aucun code promo créé.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                <th className="pb-2 pr-4">Nom</th>
                <th className="pb-2 pr-4">Réduction</th>
                <th className="pb-2 pr-4">Durée</th>
                <th className="pb-2 pr-4">Utilisations</th>
                <th className="pb-2 pr-4">Statut</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {codes.map(c => (
                <tr key={c.id}>
                  <td className="py-3 pr-4 font-medium">{c.name || c.id}</td>
                  <td className="py-3 pr-4">
                    {c.percentOff != null
                      ? `${c.percentOff}%`
                      : c.amountOff != null
                        ? `${(c.amountOff / 100).toFixed(2)} €`
                        : "—"}
                  </td>
                  <td className="py-3 pr-4 capitalize">
                    {c.duration === "once"
                      ? "Une fois"
                      : c.duration === "forever"
                        ? "Illimitée"
                        : "Répétée"}
                  </td>
                  <td className="py-3 pr-4">
                    {c.timesRedeemed}
                    {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
                  </td>
                  <td className="py-3 pr-4">
                    {c.valid ? (
                      <span className="inline-flex items-center gap-1 text-green-700 text-xs">
                        <CheckCircle2 className="w-3 h-3" /> Actif
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: c.id })}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground font-sans mt-4">
        Les codes promo s'appliquent automatiquement lors du paiement Stripe
        (abonnements et achats à l'unité).
      </p>
    </div>
  );
}

// ─── Infos du site ────────────────────────────────────────────────────────────

function ImageUploadField({ label, settingKey, value, onChange, onSave, saving }: {
  label: string;
  settingKey: string;
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const folder = settingKey.includes("favicon") ? "favicons" : "logos";
      const res = await fetch(`/api/upload/image?folder=${folder}`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Erreur upload");
      const { url } = await res.json();
      onChange(url);
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1">
      <Label className="font-sans text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder="https://..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="font-sans text-sm"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          aria-label={`Uploader ${label} depuis le PC`}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="font-sans shrink-0"
          title="Uploader depuis le PC"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="font-sans shrink-0"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
        </Button>
      </div>
      {value && (settingKey.includes("logo") || settingKey.includes("favicon")) && (
        <img src={value} alt={label} className="mt-1 h-8 w-auto object-contain border border-border rounded p-0.5 bg-muted/30" />
      )}
    </div>
  );
}

// ─── Réseaux sociaux ──────────────────────────────────────────────────────────

function SocialSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Enregistré");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const getVal = (key: string) =>
    settings?.find(s => s.key === key)?.value ?? "";
  const [form, setForm] = useState<Record<string, string>>({});
  const field = (key: string) => (key in form ? form[key] : getVal(key));
  const set = (key: string, val: string) =>
    setForm(f => ({ ...f, [key]: val }));
  const save = (key: string) => setMutation.mutate({ key, value: field(key) });

  const socials = [
    {
      key: "social_twitter",
      label: "Twitter / X",
      placeholder: "https://twitter.com/habari",
    },
    {
      key: "social_linkedin",
      label: "LinkedIn",
      placeholder: "https://linkedin.com/company/habari",
    },
    {
      key: "social_facebook",
      label: "Facebook",
      placeholder: "https://facebook.com/habari",
    },
    {
      key: "social_instagram",
      label: "Instagram",
      placeholder: "https://instagram.com/habari",
    },
    {
      key: "social_youtube",
      label: "YouTube",
      placeholder: "https://youtube.com/@habari",
    },
  ];

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Share2 className="w-5 h-5" /> Réseaux sociaux
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        URLs affichées dans le footer et les partages.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {socials.map(s => (
          <div key={s.key} className="space-y-1">
            <Label className="font-sans text-xs">{s.label}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={s.placeholder}
                value={field(s.key)}
                onChange={e => set(s.key, e.target.value)}
                className="font-sans text-sm"
              />
              <Button
                size="sm"
                onClick={() => save(s.key)}
                disabled={setMutation.isPending}
                className="font-sans shrink-0"
              >
                OK
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Code promo actif ─────────────────────────────────────────────────────────

function ActivePromoSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Enregistré");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const getVal = (key: string) =>
    settings?.find(s => s.key === key)?.value ?? "";
  const [form, setForm] = useState<Record<string, string>>({});
  const field = (key: string) => (key in form ? form[key] : getVal(key));
  const set = (key: string, val: string) =>
    setForm(f => ({ ...f, [key]: val }));
  const save = (key: string) => setMutation.mutate({ key, value: field(key) });

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Tag className="w-5 h-5" /> Code promo affiché sur le site
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        Ce code et ce message seront visibles sur la page d'abonnements et dans
        la bannière du site. Laissez vide pour ne rien afficher.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="font-sans text-xs">Code promo à afficher</Label>
          <div className="flex gap-2">
            <Input
              placeholder="ex: LANCEMENT20"
              value={field("promo_code_active")}
              onChange={e => set("promo_code_active", e.target.value)}
              className="font-sans text-sm font-mono"
            />
            <Button
              size="sm"
              onClick={() => save("promo_code_active")}
              disabled={setMutation.isPending}
              className="font-sans shrink-0"
            >
              OK
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="font-sans text-xs">Message d'accompagnement</Label>
          <div className="flex gap-2">
            <Input
              placeholder="ex: -20% sur votre abonnement"
              value={field("promo_message")}
              onChange={e => set("promo_message", e.target.value)}
              className="font-sans text-sm"
            />
            <Button
              size="sm"
              onClick={() => save("promo_message")}
              disabled={setMutation.isPending}
              className="font-sans shrink-0"
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Période de lancement ─────────────────────────────────────────────────────

function LaunchSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Date mise à jour");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const currentDate =
    settings?.find(s => s.key === "launch_end_date")?.value ?? "2026-06-01";
  const [date, setDate] = useState("");
  const [edited, setEdited] = useState(false);

  const displayDate = edited ? date : currentDate;

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Calendar className="w-5 h-5" /> Période de lancement
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        Durant cette période, tous les utilisateurs inscrits ont accès premium
        gratuit. Date actuelle : <strong>{currentDate}</strong>
      </p>
      <div className="flex items-end gap-3 max-w-xs">
        <div className="flex-1 space-y-1">
          <Label className="font-sans text-sm">Date de fin (YYYY-MM-DD)</Label>
          <Input
            type="date"
            value={edited ? date : currentDate}
            onChange={e => {
              setDate(e.target.value);
              setEdited(true);
            }}
            className="font-sans"
          />
        </div>
        <Button
          onClick={() => {
            setMutation.mutate({ key: "launch_end_date", value: displayDate });
            setEdited(false);
          }}
          disabled={!edited || setMutation.isPending}
          className="font-sans bg-primary hover:bg-primary/90"
        >
          {setMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground font-sans mt-3">
        Note : le code serveur doit également être mis à jour pour utiliser
        cette date dynamique.
      </p>
    </div>
  );
}

// ─── Prix abonnements ─────────────────────────────────────────────────────────

function SubscriptionPriceSettings() {
  const { data: plans, refetch } = trpc.subscriptions.plans.useQuery();
  const updateMutation = trpc.admin.subscriptionPlans.update.useMutation({
    onSuccess: () => { toast.success("Prix mis à jour"); refetch(); },
    onError: e => toast.error(e.message),
  });

  // magazine_pdf_price stays in siteSettings (handled separately)
  const { data: settings, refetch: refetchSettings } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => { toast.success("Prix PDF mis à jour"); refetchSettings(); },
    onError: e => toast.error(e.message),
  });

  const [pdfPrice, setPdfPrice] = useState("");
  const getPdfVal = () => pdfPrice !== "" ? pdfPrice : (settings?.find(s => s.key === "magazine_pdf_price")?.value ?? "");

  const getPlan = (tier: "premium" | "integral") =>
    plans?.find(p => p.tier === tier);

  const [form, setForm] = useState<Record<string, string>>({});
  const getField = (key: string, fallback: string) => key in form ? form[key] : fallback;
  const setField = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const premium = getPlan("premium");
  const integral = getPlan("integral");

  const savePlan = (tier: "premium" | "integral", monthlyKey: string, annualKey: string) => {
    const plan = getPlan(tier);
    updateMutation.mutate({
      tier,
      monthlyPrice: getField(monthlyKey, plan?.monthlyPrice ?? ""),
      annualPrice: getField(annualKey, plan?.annualPrice ?? ""),
    });
  };

  const planRows: { tier: "premium" | "integral"; monthlyKey: string; annualKey: string; label: string }[] = [
    { tier: "premium", monthlyKey: "premium_monthly", annualKey: "premium_annual", label: "Accès Premium" },
    { tier: "integral", monthlyKey: "integral_monthly", annualKey: "integral_annual", label: "Habari Intégral" },
  ];

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <CreditCard className="w-5 h-5" /> Prix des abonnements
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        Ces prix sont affichés sur la page abonnements. Les prix Stripe (facturation réelle) restent dans le dashboard Stripe.
      </p>
      <div className="space-y-4">
        {planRows.map(({ tier, monthlyKey, annualKey, label }) => {
          const plan = getPlan(tier);
          return (
            <div key={tier} className="border border-border rounded-lg p-4">
              <p className="font-sans text-sm font-semibold text-foreground mb-3">{label}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="font-sans text-xs">Mensuel (€)</Label>
                  <Input
                    placeholder="ex: 4.50"
                    value={getField(monthlyKey, plan?.monthlyPrice ?? "")}
                    onChange={e => setField(monthlyKey, e.target.value)}
                    className="font-sans text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-sans text-xs">Annuel (€)</Label>
                  <Input
                    placeholder="ex: 45.00"
                    value={getField(annualKey, plan?.annualPrice ?? "")}
                    onChange={e => setField(annualKey, e.target.value)}
                    className="font-sans text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  onClick={() => savePlan(tier, monthlyKey, annualKey)}
                  disabled={updateMutation.isPending}
                  className="font-sans"
                >
                  {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enregistrer"}
                </Button>
              </div>
            </div>
          );
        })}

        {/* Magazine PDF */}
        <div className="border border-border rounded-lg p-4">
          <p className="font-sans text-sm font-semibold text-foreground mb-3">Magazine PDF — à l'unité</p>
          <div className="space-y-1 max-w-xs">
            <Label className="font-sans text-xs">Prix (€)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="ex: 4.99"
                value={getPdfVal()}
                onChange={e => setPdfPrice(e.target.value)}
                className="font-sans text-sm"
              />
              <Button
                size="sm"
                onClick={() => {
                  const cents = Math.round(parseFloat(getPdfVal().replace(",", ".")) * 100).toString();
                  setMutation.mutate({ key: "magazine_pdf_price", value: cents });
                }}
                disabled={setMutation.isPending}
                className="font-sans shrink-0"
              >
                {setMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-sans">Valeur actuelle en DB : {settings?.find(s => s.key === "magazine_pdf_price")?.value ?? "499"} centimes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Slides ─────────────────────────────────────────────────────────────

const FALLBACK_HERO_SLIDES = [
  { rubrique: "Dossier Central", title: "Panne sèche à la CEMAC", excerpt: "La zone CEMAC traverse une période charnière.", image: "", slug: "cemac-panne-seche", stats: { label1: "265M hab.", label2: "~265 Mds $ PIB", label3: "11 pays" } },
];

function HeroSlidesSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({ onSuccess: () => { toast.success("Slides sauvegardés"); refetch(); }, onError: e => toast.error(e.message) });

  const raw = settings?.find(s => s.key === "homepage_hero_slides")?.value;
  const [slides, setSlides] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && settings) {
    try { setSlides(raw ? JSON.parse(raw) : FALLBACK_HERO_SLIDES); } catch { setSlides(FALLBACK_HERO_SLIDES); }
    setInitialized(true);
  }

  const update = (i: number, field: string, val: string) => {
    setSlides(prev => prev.map((s, idx) => idx === i ? (field.startsWith("stats.") ? { ...s, stats: { ...s.stats, [field.slice(6)]: val } } : { ...s, [field]: val }) : s));
  };

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Settings className="w-5 h-5" /> Hero Carousel
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">Slides du carousel principal de la page d'accueil.</p>
      <div className="space-y-4">
        {slides.map((slide, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold font-sans">Slide {i + 1}</span>
              <Button size="sm" variant="ghost" onClick={() => setSlides(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="font-sans text-xs">Rubrique</Label><Input value={slide.rubrique} onChange={e => update(i, "rubrique", e.target.value)} className="font-sans text-sm" /></div>
              <div><Label className="font-sans text-xs">Slug</Label><Input value={slide.slug} onChange={e => update(i, "slug", e.target.value)} className="font-sans text-sm" /></div>
            </div>
            <div><Label className="font-sans text-xs">Titre</Label><Input value={slide.title} onChange={e => update(i, "title", e.target.value)} className="font-sans text-sm" /></div>
            <div><Label className="font-sans text-xs">Extrait</Label><Input value={slide.excerpt} onChange={e => update(i, "excerpt", e.target.value)} className="font-sans text-sm" /></div>
            <div><Label className="font-sans text-xs">Image URL</Label><Input value={slide.image} onChange={e => update(i, "image", e.target.value)} className="font-sans text-sm" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="font-sans text-xs">Stat 1</Label><Input value={slide.stats?.label1 ?? ""} onChange={e => update(i, "stats.label1", e.target.value)} className="font-sans text-sm" /></div>
              <div><Label className="font-sans text-xs">Stat 2</Label><Input value={slide.stats?.label2 ?? ""} onChange={e => update(i, "stats.label2", e.target.value)} className="font-sans text-sm" /></div>
              <div><Label className="font-sans text-xs">Stat 3</Label><Input value={slide.stats?.label3 ?? ""} onChange={e => update(i, "stats.label3", e.target.value)} className="font-sans text-sm" /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <Button variant="outline" size="sm" onClick={() => setSlides(prev => [...prev, { rubrique: "", title: "", excerpt: "", image: "", slug: "", stats: { label1: "", label2: "", label3: "" } }])} className="font-sans">
          <Plus className="w-4 h-4 mr-1" /> Ajouter un slide
        </Button>
        <Button onClick={() => setMutation.mutate({ key: "homepage_hero_slides", value: JSON.stringify(slides) })} disabled={setMutation.isPending} className="font-sans bg-primary hover:bg-primary/90">
          {setMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}

// ─── Green Metrics ────────────────────────────────────────────────────────────

function GreenMetricsSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({ onSuccess: () => { toast.success("Métriques sauvegardées"); refetch(); }, onError: e => toast.error(e.message) });

  const raw = settings?.find(s => s.key === "homepage_green_metrics")?.value;
  const [metrics, setMetrics] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && settings) {
    try { setMetrics(raw ? JSON.parse(raw) : [{ label: "Prix crédit VCM", value: "$6,20", trend: "+12%" }, { label: "Projets REDD+", value: "47", trend: "+8" }, { label: "Finance verte/an", value: "$0,8 Md", trend: "+15%" }, { label: "Potentiel hydro", value: "107 GW", trend: "CEEAC" }]); } catch { setMetrics([]); }
    setInitialized(true);
  }

  const update = (i: number, field: string, val: string) => setMetrics(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Settings className="w-5 h-5" /> Habari Green — Indicateurs
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">Métriques affichées dans le widget Habari Green.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-xs font-semibold font-sans">Indicateur {i + 1}</span><Button size="sm" variant="ghost" onClick={() => setMetrics(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button></div>
            <div><Label className="font-sans text-xs">Label</Label><Input value={m.label} onChange={e => update(i, "label", e.target.value)} className="font-sans text-sm" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="font-sans text-xs">Valeur</Label><Input value={m.value} onChange={e => update(i, "value", e.target.value)} className="font-sans text-sm" /></div>
              <div><Label className="font-sans text-xs">Tendance</Label><Input value={m.trend} onChange={e => update(i, "trend", e.target.value)} className="font-sans text-sm" /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <Button variant="outline" size="sm" onClick={() => setMetrics(prev => [...prev, { label: "", value: "", trend: "" }])} className="font-sans"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
        <Button onClick={() => setMutation.mutate({ key: "homepage_green_metrics", value: JSON.stringify(metrics) })} disabled={setMutation.isPending} className="font-sans bg-primary hover:bg-primary/90">
          {setMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}

// ─── Green Categories ─────────────────────────────────────────────────────────

const GREEN_ICON_OPTIONS = ["BarChart3", "TreePine", "Zap", "Landmark", "Users", "BookOpen", "Globe", "Leaf"];

function GreenCategoriesSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({ onSuccess: () => { toast.success("Catégories sauvegardées"); refetch(); }, onError: e => toast.error(e.message) });

  const raw = settings?.find(s => s.key === "homepage_green_categories")?.value;
  const [cats, setCats] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && settings) {
    try { setCats(raw ? JSON.parse(raw) : [{ label: "Marchés carbone", href: "/green/carbone", iconKey: "BarChart3" }]); } catch { setCats([]); }
    setInitialized(true);
  }

  const update = (i: number, field: string, val: string) => setCats(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Settings className="w-5 h-5" /> Habari Green — Sous-rubriques
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">Cartes de navigation dans la section Habari Green.</p>
      <div className="space-y-3">
        {cats.map((c, i) => (
          <div key={i} className="border border-border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2"><span className="text-xs font-semibold font-sans">Catégorie {i + 1}</span><Button size="sm" variant="ghost" onClick={() => setCats(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="font-sans text-xs">Label</Label><Input value={c.label} onChange={e => update(i, "label", e.target.value)} className="font-sans text-sm" /></div>
              <div><Label className="font-sans text-xs">Lien (href)</Label><Input value={c.href} onChange={e => update(i, "href", e.target.value)} className="font-sans text-sm" /></div>
              <div>
                <Label className="font-sans text-xs">Icône</Label>
                <select value={c.iconKey} onChange={e => update(i, "iconKey", e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm font-sans">
                  {GREEN_ICON_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <Button variant="outline" size="sm" onClick={() => setCats(prev => [...prev, { label: "", href: "", iconKey: "BarChart3" }])} className="font-sans"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
        <Button onClick={() => setMutation.mutate({ key: "homepage_green_categories", value: JSON.stringify(cats) })} disabled={setMutation.isPending} className="font-sans bg-primary hover:bg-primary/90">
          {setMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}

// ─── Ecosystem Cards ──────────────────────────────────────────────────────────

function EcosystemCardsSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({ onSuccess: () => { toast.success("Cartes sauvegardées"); refetch(); }, onError: e => toast.error(e.message) });

  const raw = settings?.find(s => s.key === "homepage_ecosystem_cards")?.value;
  const [cards, setCards] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && settings) {
    try { setCards(raw ? JSON.parse(raw) : [{ title: "Annuaire économique", desc: "Répertoire des acteurs clés de la zone CEEAC", href: "/annuaire", badge: "" }]); } catch { setCards([]); }
    setInitialized(true);
  }

  const update = (i: number, field: string, val: string) => setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Settings className="w-5 h-5" /> L'écosystème Habari — Cartes services
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">Les 4 cartes de services en bas de la page d'accueil. Les icônes sont assignées dans l'ordre (Globe, Briefcase, Users, Calendar).</p>
      <div className="space-y-3">
        {cards.map((c, i) => (
          <div key={i} className="border border-border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2"><span className="text-xs font-semibold font-sans">Carte {i + 1}</span><Button size="sm" variant="ghost" onClick={() => setCards(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="font-sans text-xs">Titre</Label><Input value={c.title} onChange={e => update(i, "title", e.target.value)} className="font-sans text-sm" /></div>
              <div><Label className="font-sans text-xs">Lien (href)</Label><Input value={c.href} onChange={e => update(i, "href", e.target.value)} className="font-sans text-sm" /></div>
            </div>
            <div className="mt-2"><Label className="font-sans text-xs">Description</Label><Input value={c.desc} onChange={e => update(i, "desc", e.target.value)} className="font-sans text-sm" /></div>
            <div className="mt-2"><Label className="font-sans text-xs">Badge (laisser vide si aucun)</Label><Input value={c.badge} onChange={e => update(i, "badge", e.target.value)} className="font-sans text-sm" placeholder="ex: Premium" /></div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <Button variant="outline" size="sm" onClick={() => setCards(prev => [...prev, { title: "", desc: "", href: "", badge: "" }])} className="font-sans"><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
        <Button onClick={() => setMutation.mutate({ key: "homepage_ecosystem_cards", value: JSON.stringify(cards) })} disabled={setMutation.isPending} className="font-sans bg-primary hover:bg-primary/90">
          {setMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Paramètres
          </h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            Configuration de la plateforme et codes promotionnels
          </p>
        </div>
        <SocialSettings />
        <LaunchSettings />
        <ActivePromoSettings />
        <PdfPriceSettings />
        <SubscriptionPriceSettings />
        <PromoCodeSettings />
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground mb-4">Page d'accueil</h2>
          <div className="space-y-6">
            <HeroSlidesSettings />
            <GreenMetricsSettings />
            <GreenCategoriesSettings />
            <EcosystemCardsSettings />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
