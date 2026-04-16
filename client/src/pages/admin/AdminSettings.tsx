import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Settings, Tag, Trash2, Plus, Loader2, CheckCircle2, Globe, Share2, Search, Calendar, CreditCard } from "lucide-react";

// ─── Prix PDF ───────────────────────────────────────────────────────────────

function PdfPriceSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => { toast.success("Prix mis à jour"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const currentPrice = settings?.find(s => s.key === "magazine_pdf_price")?.value ?? "499";
  const [euros, setEuros] = useState<string>("");
  const [edited, setEdited] = useState(false);

  const displayPrice = edited ? euros : (parseInt(currentPrice) / 100).toFixed(2).replace(".", ",");

  const handleSave = () => {
    const val = parseFloat(euros.replace(",", "."));
    if (isNaN(val) || val <= 0) { toast.error("Prix invalide"); return; }
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
        Prix actuel en base : <strong>{(parseInt(currentPrice) / 100).toFixed(2)} €</strong>
      </p>
      <div className="flex items-end gap-3 max-w-xs">
        <div className="flex-1 space-y-1">
          <Label className="font-sans text-sm">Nouveau prix (€)</Label>
          <Input
            type="text"
            placeholder={displayPrice}
            value={edited ? euros : ""}
            onChange={(e) => { setEuros(e.target.value); setEdited(true); }}
            className="font-sans"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={!edited || setMutation.isPending}
          className="font-sans bg-primary hover:bg-primary/90"
        >
          {setMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
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
  const { data: codes, refetch, isLoading } = trpc.admin.promoCodes.list.useQuery();
  const createMutation = trpc.admin.promoCodes.create.useMutation({
    onSuccess: () => { toast.success("Code promo créé"); refetch(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.promoCodes.delete.useMutation({
    onSuccess: () => { toast.success("Code supprimé"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const emptyForm: CreateForm = { name: "", type: "percent", value: "", duration: "once", durationInMonths: "", maxRedemptions: "", redeemBy: "" };
  const [form, setForm] = useState<CreateForm>(emptyForm);
  const resetForm = () => setForm(emptyForm);

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Nom requis"); return; }
    const val = parseFloat(form.value.replace(",", "."));
    if (isNaN(val) || val <= 0) { toast.error("Valeur invalide"); return; }
    createMutation.mutate({
      name: form.name,
      ...(form.type === "percent" ? { percentOff: val } : { amountOff: Math.round(val * 100) }),
      duration: form.duration,
      ...(form.duration === "repeating" && form.durationInMonths ? { durationInMonths: parseInt(form.durationInMonths) } : {}),
      ...(form.maxRedemptions ? { maxRedemptions: parseInt(form.maxRedemptions) } : {}),
      ...(form.redeemBy ? { redeemBy: new Date(form.redeemBy).toISOString() } : {}),
    });
  };

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
          <Tag className="w-5 h-5" /> Codes promotionnels
        </h2>
        <Button size="sm" onClick={() => setShowForm(v => !v)} className="font-sans gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nouveau code
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border space-y-4">
          <h3 className="font-sans font-semibold text-sm">Créer un code promo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-sans text-xs">Nom du coupon</Label>
              <Input placeholder="EX: LANCEMENT20" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="font-sans text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">Type de réduction</Label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as "percent" | "amount" }))}
                className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background"
                title="Type de réduction"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="amount">Montant fixe (€)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">{form.type === "percent" ? "Réduction (%)" : "Montant (€)"}</Label>
              <Input placeholder={form.type === "percent" ? "20" : "2,00"} value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="font-sans text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">Durée</Label>
              <select
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value as "once" | "forever" | "repeating" }))}
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
                <Input placeholder="3" value={form.durationInMonths} onChange={e => setForm(f => ({ ...f, durationInMonths: e.target.value }))} className="font-sans text-sm" />
              </div>
            )}
            <div className="space-y-1">
              <Label className="font-sans text-xs">Utilisations max (optionnel)</Label>
              <Input placeholder="100" value={form.maxRedemptions} onChange={e => setForm(f => ({ ...f, maxRedemptions: e.target.value }))} className="font-sans text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">Date d'expiration (optionnel)</Label>
              <Input type="date" value={form.redeemBy} onChange={e => setForm(f => ({ ...f, redeemBy: e.target.value }))} className="font-sans text-sm" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="font-sans bg-primary hover:bg-primary/90">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="font-sans">Annuler</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : !codes || codes.length === 0 ? (
        <p className="text-sm text-muted-foreground font-sans py-4 text-center">Aucun code promo créé.</p>
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
                    {c.percentOff != null ? `${c.percentOff}%` : c.amountOff != null ? `${(c.amountOff / 100).toFixed(2)} €` : "—"}
                  </td>
                  <td className="py-3 pr-4 capitalize">{c.duration === "once" ? "Une fois" : c.duration === "forever" ? "Illimitée" : "Répétée"}</td>
                  <td className="py-3 pr-4">{c.timesRedeemed}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}</td>
                  <td className="py-3 pr-4">
                    {c.valid
                      ? <span className="inline-flex items-center gap-1 text-green-700 text-xs"><CheckCircle2 className="w-3 h-3" /> Actif</span>
                      : <span className="text-muted-foreground text-xs">Inactif</span>}
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
        Les codes promo s'appliquent automatiquement lors du paiement Stripe (abonnements et achats à l'unité).
      </p>
    </div>
  );
}

// ─── Infos du site ────────────────────────────────────────────────────────────

function SiteInfoSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => { toast.success("Paramètre enregistré"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const getVal = (key: string, fallback = "") =>
    settings?.find(s => s.key === key)?.value ?? fallback;

  const [form, setForm] = useState<Record<string, string>>({});
  const field = (key: string) => (key in form ? form[key] : getVal(key));
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const save = (key: string) => {
    const val = field(key);
    setMutation.mutate({ key, value: val });
  };

  const fields: { key: string; label: string; placeholder: string; type?: string }[] = [
    { key: "site_name", label: "Nom du site", placeholder: "Habari Magazine" },
    { key: "site_tagline", label: "Slogan", placeholder: "L'actualité économique de l'Afrique centrale" },
    { key: "site_logo_url", label: "URL du logo", placeholder: "https://..." },
    { key: "site_favicon_url", label: "URL du favicon", placeholder: "https://..." },
    { key: "contact_email", label: "Email de contact", placeholder: "contact@habari-magazine.com" },
  ];

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Globe className="w-5 h-5" /> Informations du site
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">Paramètres généraux affichés sur le site.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className="space-y-1">
            <Label className="font-sans text-xs">{f.label}</Label>
            <div className="flex gap-2">
              <Input
                type={f.type || "text"}
                placeholder={f.placeholder}
                value={field(f.key)}
                onChange={e => set(f.key, e.target.value)}
                className="font-sans text-sm"
              />
              <Button size="sm" onClick={() => save(f.key)} disabled={setMutation.isPending} className="font-sans shrink-0">
                {setMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Réseaux sociaux ──────────────────────────────────────────────────────────

function SocialSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => { toast.success("Enregistré"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const getVal = (key: string) => settings?.find(s => s.key === key)?.value ?? "";
  const [form, setForm] = useState<Record<string, string>>({});
  const field = (key: string) => (key in form ? form[key] : getVal(key));
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const save = (key: string) => setMutation.mutate({ key, value: field(key) });

  const socials = [
    { key: "social_twitter", label: "Twitter / X", placeholder: "https://twitter.com/habari" },
    { key: "social_linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/habari" },
    { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/habari" },
    { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/habari" },
    { key: "social_youtube", label: "YouTube", placeholder: "https://youtube.com/@habari" },
  ];

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Share2 className="w-5 h-5" /> Réseaux sociaux
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">URLs affichées dans le footer et les partages.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {socials.map(s => (
          <div key={s.key} className="space-y-1">
            <Label className="font-sans text-xs">{s.label}</Label>
            <div className="flex gap-2">
              <Input placeholder={s.placeholder} value={field(s.key)} onChange={e => set(s.key, e.target.value)} className="font-sans text-sm" />
              <Button size="sm" onClick={() => save(s.key)} disabled={setMutation.isPending} className="font-sans shrink-0">OK</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

function SeoSettings() {
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => { toast.success("Enregistré"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const getVal = (key: string) => settings?.find(s => s.key === key)?.value ?? "";
  const [form, setForm] = useState<Record<string, string>>({});
  const field = (key: string) => (key in form ? form[key] : getVal(key));
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const save = (key: string) => setMutation.mutate({ key, value: field(key) });

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Search className="w-5 h-5" /> SEO & Méta-données
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">Paramètres par défaut pour les moteurs de recherche.</p>
      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="font-sans text-xs">Description par défaut (meta description)</Label>
          <div className="flex gap-2">
            <textarea
              placeholder="Habari Magazine, l'actualité économique, financière et environnementale de l'Afrique centrale..."
              value={field("seo_meta_description")}
              onChange={e => set("seo_meta_description", e.target.value)}
              rows={3}
              className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background resize-none"
            />
            <Button size="sm" onClick={() => save("seo_meta_description")} disabled={setMutation.isPending} className="font-sans shrink-0 self-start">OK</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="font-sans text-xs">Image Open Graph par défaut (URL)</Label>
            <div className="flex gap-2">
              <Input placeholder="https://..." value={field("seo_og_image")} onChange={e => set("seo_og_image", e.target.value)} className="font-sans text-sm" />
              <Button size="sm" onClick={() => save("seo_og_image")} disabled={setMutation.isPending} className="font-sans shrink-0">OK</Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-xs">Mots-clés par défaut</Label>
            <div className="flex gap-2">
              <Input placeholder="économie, Afrique, finance, CEEAC" value={field("seo_keywords")} onChange={e => set("seo_keywords", e.target.value)} className="font-sans text-sm" />
              <Button size="sm" onClick={() => save("seo_keywords")} disabled={setMutation.isPending} className="font-sans shrink-0">OK</Button>
            </div>
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
    onSuccess: () => { toast.success("Date mise à jour"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const currentDate = settings?.find(s => s.key === "launch_end_date")?.value ?? "2026-06-01";
  const [date, setDate] = useState("");
  const [edited, setEdited] = useState(false);

  const displayDate = edited ? date : currentDate;

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <Calendar className="w-5 h-5" /> Période de lancement
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-4">
        Durant cette période, tous les utilisateurs inscrits ont accès premium gratuit.
        Date actuelle : <strong>{currentDate}</strong>
      </p>
      <div className="flex items-end gap-3 max-w-xs">
        <div className="flex-1 space-y-1">
          <Label className="font-sans text-sm">Date de fin (YYYY-MM-DD)</Label>
          <Input
            type="date"
            value={edited ? date : currentDate}
            onChange={e => { setDate(e.target.value); setEdited(true); }}
            className="font-sans"
          />
        </div>
        <Button
          onClick={() => { setMutation.mutate({ key: "launch_end_date", value: displayDate }); setEdited(false); }}
          disabled={!edited || setMutation.isPending}
          className="font-sans bg-primary hover:bg-primary/90"
        >
          {setMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground font-sans mt-3">
        Note : le code serveur doit également être mis à jour pour utiliser cette date dynamique.
      </p>
    </div>
  );
}

// ─── Prix abonnements ─────────────────────────────────────────────────────────

function SubscriptionPriceSettings() {
  const { data: plans, isLoading } = trpc.subscriptions.plans.useQuery();
  const setMutation = trpc.admin.settings.set.useMutation({
    onSuccess: () => toast.success("Enregistré (référence interne)"),
    onError: (e) => toast.error(e.message),
  });
  const { data: settings, refetch } = trpc.admin.settings.list.useQuery();

  const getVal = (key: string) => settings?.find(s => s.key === key)?.value ?? "";
  const [form, setForm] = useState<Record<string, string>>({});
  const field = (key: string) => (key in form ? form[key] : getVal(key));
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const save = (key: string) => { setMutation.mutate({ key, value: field(key) }); refetch(); };

  const priceKeys = [
    { key: "price_standard_monthly", label: "Standard mensuel (€)" },
    { key: "price_standard_annual", label: "Standard annuel (€)" },
    { key: "price_premium_monthly", label: "Premium mensuel (€)" },
    { key: "price_premium_annual", label: "Premium annuel (€)" },
    { key: "price_enterprise_monthly", label: "Entreprise mensuel (€)" },
    { key: "price_enterprise_annual", label: "Entreprise annuel (€)" },
  ];

  return (
    <div className="bg-background border border-border rounded-xl p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-primary mb-1 flex items-center gap-2">
        <CreditCard className="w-5 h-5" /> Prix des abonnements
      </h2>
      <p className="text-sm text-muted-foreground font-sans mb-2">
        Référence interne des prix affichés. Les prix Stripe restent dans le dashboard Stripe.
      </p>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <>
          {plans && plans.length > 0 && (
            <div className="mb-4 text-xs text-muted-foreground font-sans space-y-1">
              {plans.map(p => (
                <div key={p.key}>Plan Stripe <strong>{p.name}</strong> — mensuel: {p.prices.monthly.label} / annuel: {p.prices.annual.label}</div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {priceKeys.map(pk => (
              <div key={pk.key} className="space-y-1">
                <Label className="font-sans text-xs">{pk.label}</Label>
                <div className="flex gap-2">
                  <Input placeholder="9,99" value={field(pk.key)} onChange={e => set(pk.key, e.target.value)} className="font-sans text-sm" />
                  <Button size="sm" onClick={() => save(pk.key)} disabled={setMutation.isPending} className="font-sans shrink-0">OK</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Paramètres</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">Configuration de la plateforme et codes promotionnels</p>
        </div>
        <SiteInfoSettings />
        <SocialSettings />
        <SeoSettings />
        <LaunchSettings />
        <PdfPriceSettings />
        <SubscriptionPriceSettings />
        <PromoCodeSettings />
      </div>
    </AdminLayout>
  );
}
