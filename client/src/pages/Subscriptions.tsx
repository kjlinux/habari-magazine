import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

import { toast } from "sonner";
import {
  CheckCircle2, Lock, Mail, Shield, ArrowRight,
  BookOpen, Loader2, Check, Crown, Zap, Star, Tag
} from "lucide-react";
import { Link, useSearch } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type PlanInterval = "monthly" | "annual";

export default function Subscriptions() {
  const { user, isAuthenticated } = useAuth();
  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlDone, setNlDone] = useState(false);
  const [interval, setInterval] = useState<PlanInterval>("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation();
  const checkoutMutation = trpc.stripe.createCheckout.useMutation();
  const userTier = user?.subscriptionTier ?? "free";
  const { data: promo } = trpc.siteConfig.promo.useQuery(undefined, { staleTime: 1000 * 60 * 10 });
  const { data: plans } = trpc.subscriptions.plans.useQuery();
  const { data: pdfPriceData } = trpc.magazine.pdfPrice.useQuery();

  const premiumPlan = plans?.find(p => p.tier === "premium");
  const integralPlan = plans?.find(p => p.tier === "integral");

  const fmt = (val: string | null | undefined) =>
    val ? parseFloat(val).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €" : "—";

  const pdfPriceFmt = pdfPriceData?.formatted ?? "4,99 €";

  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session_id");

  const handleNewsletterSubmit = async (e: React.FormEvent, tier: "free" | "premium") => {
    e.preventDefault();
    if (!nlEmail) return;
    if (tier === "premium" && !isAuthenticated) {
      toast.error("Connectez-vous et souscrivez à un abonnement Premium ou Intégral pour la newsletter premium.");
      window.location.href = "/login";
      return;
    }
    setNlLoading(true);
    try {
      await subscribeMutation.mutateAsync({ email: nlEmail, tier });
      setNlDone(true);
      toast.success(tier === "free"
        ? "Inscription à la newsletter gratuite confirmée !"
        : "Inscription à la newsletter premium confirmée !"
      );
    } catch (err: any) {
      toast.error(err?.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setNlLoading(false);
    }
  };

  const handleCheckout = async (productKey: "premiumAccess" | "newsletterPremium" | "bundle") => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setCheckoutLoading(productKey);
    try {
      const result = await checkoutMutation.mutateAsync({
        productKey,
        interval,
        origin: window.location.origin,
      });
      toast.info("Redirection vers la page de paiement sécurisé...");
      window.open(result.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création de la session de paiement.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-[oklch(0.20_0.02_250)] py-16 md:py-20">
        <div className="container text-center">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-4">Votre Accès Habari</div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Choisissez votre formule
          </h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mx-auto mb-6"></div>
          <p className="text-lg text-white/65 max-w-2xl mx-auto font-sans">
            Accédez au contenu qui correspond à vos besoins. Du résumé hebdomadaire gratuit aux analyses exclusives réservées aux abonnés premium.
          </p>
        </div>
      </section>

      {/* Promo Banner */}
      {promo?.active && (
        <div className="bg-[oklch(0.72_0.15_75)]/10 border-b border-[oklch(0.72_0.15_75)]/20 py-3">
          <div className="container flex items-center justify-center gap-3 text-sm font-sans flex-wrap">
            <Tag className="w-4 h-4 text-[oklch(0.50_0.15_75)] shrink-0" />
            <span className="text-foreground">
              {promo.message && <span className="mr-1">{promo.message} —</span>}
              Utilisez le code{" "}
              <span className="font-mono font-bold text-base bg-white border border-[oklch(0.72_0.15_75)]/40 px-2 py-0.5 rounded tracking-widest">
                {promo.code}
              </span>{" "}
              lors du paiement pour bénéficier de la réduction.
            </span>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {sessionId && (
        <div className="bg-green-50 border-b border-green-200 py-4">
          <div className="container flex items-center justify-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-serif font-bold text-green-800">Paiement réussi !</p>
              <p className="text-sm text-green-700 font-sans">Votre abonnement est maintenant actif. Bienvenue dans la communauté Habari Premium.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ INTERVAL TOGGLE ═══════ */}
      <section className="pt-12 pb-4">
        <div className="container">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-sans font-medium ${interval === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
              Mensuel
            </span>
            <button
              onClick={() => setInterval(interval === "monthly" ? "annual" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${interval === "annual" ? "bg-[oklch(0.72_0.15_75)]" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${interval === "annual" ? "translate-x-7" : ""}`} />
            </button>
            <span className={`text-sm font-sans font-medium ${interval === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
              Annuel
            </span>
            {interval === "annual" && (
              <span className="text-xs font-sans font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                2 mois offerts
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ PLANS ═══════ */}
      <section className="py-8 pb-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* ── Accès libre ── */}
            <Card className="border border-border overflow-hidden">
              <CardContent className="p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Accès libre</h3>
                    <span className="text-xs font-sans text-green-700 font-semibold">Gratuit</span>
                  </div>
                </div>
                <div className="mb-5">
                  <span className="text-3xl font-serif font-bold text-foreground">0 €</span>
                  <span className="text-sm text-muted-foreground font-sans">/mois</span>
                </div>
                <ul className="space-y-2.5 text-sm font-sans text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Baromètre économique mensuel CEEAC</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>2-3 articles par numéro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Agenda complet des événements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Annuaire des acteurs économiques</span>
                  </li>
                </ul>
                {!isAuthenticated ? (
                  <a href={"/login"}>
                    <Button className="w-full font-sans bg-primary hover:bg-primary/90">
                      Créer un compte gratuit
                    </Button>
                  </a>
                ) : userTier === "free" ? (
                  <Button className="w-full font-sans" variant="outline" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accès actif
                  </Button>
                ) : (
                  <Button className="w-full font-sans" variant="outline" disabled>
                    Inclus dans votre abonnement
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ── Premium ── */}
            <Card className="border-2 border-[oklch(0.72_0.15_75)] overflow-hidden relative shadow-lg">
              <div className="absolute top-0 left-0 right-0 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] text-center py-1.5 text-xs font-sans font-bold uppercase tracking-wider">
                Recommandé
              </div>
              <CardContent className="p-7 pt-11">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-[oklch(0.72_0.15_75)]/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[oklch(0.55_0.12_75)]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Accès Premium</h3>
                    <span className="text-xs font-sans text-[oklch(0.55_0.12_75)] font-semibold">Site complet</span>
                  </div>
                </div>
                <div className="mb-5">
                  <span className="text-3xl font-serif font-bold text-foreground">
                    {interval === "monthly" ? fmt(premiumPlan?.monthlyPrice) : fmt(premiumPlan?.annualPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground font-sans">
                    /{interval === "monthly" ? "mois" : "an"}
                  </span>
                  {interval === "annual" && premiumPlan?.annualPrice && (
                    <span className="block text-xs text-green-700 font-sans mt-1">
                      soit {(parseFloat(premiumPlan.annualPrice) / 12).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mois
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5 text-sm font-sans text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">Tout l'accès libre</strong> inclus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" />
                    <span>Dossiers complets et analyses approfondies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" />
                    <span>Archives complètes du magazine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" />
                    <span>Analyses pays détaillées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" />
                    <span>Tribunes exclusives de décideurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" />
                    <span>Espace investisseurs et deal flow</span>
                  </li>
                </ul>
                {isAuthenticated && (userTier === "premium" || userTier === "integral") ? (
                  <Button className="w-full font-sans" variant="outline" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-[oklch(0.72_0.15_75)]" /> Abonnement actif
                  </Button>
                ) : (
                  <Button
                    className="w-full font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] font-semibold"
                    onClick={() => handleCheckout("premiumAccess")}
                    disabled={checkoutLoading === "premiumAccess"}
                  >
                    {checkoutLoading === "premiumAccess" ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirection...</>
                    ) : (
                      <>S'abonner <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* ── Bundle Intégral ── */}
            <Card className="border-2 border-primary overflow-hidden relative shadow-lg">
              <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-1.5 text-xs font-sans font-bold uppercase tracking-wider">
                Meilleure offre
              </div>
              <CardContent className="p-7 pt-11">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Habari Intégral</h3>
                    <span className="text-xs font-sans text-primary font-semibold">Premium + Newsletter</span>
                  </div>
                </div>
                <div className="mb-5">
                  <span className="text-3xl font-serif font-bold text-foreground">
                    {interval === "monthly" ? fmt(integralPlan?.monthlyPrice) : fmt(integralPlan?.annualPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground font-sans">
                    /{interval === "monthly" ? "mois" : "an"}
                  </span>
                  {null}
                </div>
                <ul className="space-y-2.5 text-sm font-sans text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">Tout l'accès Premium</strong> inclus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Newsletter premium hebdomadaire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Données exclusives et indicateurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Invitations événements exclusifs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
                {isAuthenticated && userTier === "integral" ? (
                  <Button className="w-full font-sans" variant="outline" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Abonnement actif
                  </Button>
                ) : (
                  <Button
                    className="w-full font-sans bg-primary hover:bg-primary/90 font-semibold"
                    onClick={() => handleCheckout("bundle")}
                    disabled={checkoutLoading === "bundle"}
                  >
                    {checkoutLoading === "bundle" ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirection...</>
                    ) : (
                      <>S'abonner <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Magazine PDF à l'unité */}
          <div className="mt-10 max-w-5xl mx-auto">
            <Card className="border border-dashed border-[oklch(0.72_0.15_75)]/50 bg-[oklch(0.72_0.15_75)]/5">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[oklch(0.72_0.15_75)]/15 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[oklch(0.55_0.12_75)]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground">Magazine PDF — Numéro à l'unité</h3>
                    <p className="text-sm text-muted-foreground font-sans">Téléchargez un numéro complet au format PDF (67+ pages d'analyses)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-2xl font-serif font-bold text-foreground">{pdfPriceFmt}</span>
                  </div>
                  <Link href="/archives">
                    <Button variant="outline" className="font-sans border-[oklch(0.72_0.15_75)] text-[oklch(0.55_0.12_75)] hover:bg-[oklch(0.72_0.15_75)]/10">
                      Voir les numéros <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment info */}
          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground font-sans">

            </p>
          </div>
        </div>
      </section>

      {/* ═══════ NEWSLETTER ═══════ */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/5 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">Newsletters Habari</h2>
            <p className="text-sm text-muted-foreground font-sans">Restez informé avec nos newsletters spécialisées.</p>
            <div className="habari-separator mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Newsletter gratuite */}
            <div className="border border-border rounded-xl p-8 bg-background">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Newsletter Gratuite</h3>
                <span className="text-2xl font-serif font-bold text-green-700">0 €</span>
              </div>
              <p className="text-sm text-muted-foreground font-sans mb-6">Hebdomadaire — Chaque lundi</p>
              <ul className="space-y-2.5 text-sm font-sans text-muted-foreground mb-6">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Résumé hebdomadaire de l'actualité</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> 1 analyse courte</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Agenda des événements</li>
              </ul>
              {nlDone ? (
                <div className="flex items-center gap-2 py-3 px-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-sans text-green-700">Inscrit !</span>
                </div>
              ) : (
                <form onSubmit={(e) => handleNewsletterSubmit(e, "free")} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    required
                    className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <Button type="submit" disabled={nlLoading} className="font-sans bg-primary hover:bg-primary/90 shrink-0">
                    {nlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire"}
                  </Button>
                </form>
              )}
            </div>

            {/* Newsletter premium */}
            <div className="border-2 border-[oklch(0.72_0.15_75)] rounded-xl p-8 bg-[oklch(0.72_0.15_75)]/5 relative">
              <div className="absolute -top-3 right-4 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] text-[0.6rem] font-sans font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Premium
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Newsletter Premium</h3>
                <div className="text-right">
                  <span className="text-2xl font-serif font-bold text-[oklch(0.55_0.12_75)]">
                    {interval === "monthly" ? "5 €" : "50 €"}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans block">
                    /{interval === "monthly" ? "mois" : "an"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-sans mb-6">Hebdomadaire — Chaque lundi + alertes</p>
              <ul className="space-y-2.5 text-sm font-sans text-muted-foreground mb-6">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Tout le contenu de la newsletter gratuite</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Analyse approfondie hebdomadaire</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Données exclusives et indicateurs</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Accès aux archives complètes</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Invitations événements exclusifs</li>
              </ul>
              <Button
                className="w-full font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] font-semibold"
                onClick={() => handleCheckout("newsletterPremium")}
                disabled={checkoutLoading === "newsletterPremium"}
              >
                {checkoutLoading === "newsletterPremium" ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirection...</>
                ) : (
                  <>S'abonner <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-3xl">
          <h2 className="font-serif text-2xl font-bold text-primary text-center mb-10">Questions fréquentes</h2>
          <div className="space-y-6">
            {[
              {
                q: "Quelle est la fréquence de publication ?",
                a: "Le magazine Habari est trimestriel. Le site web est mis à jour avec 2-4 contenus par mois, plus le baromètre économique mensuel. Nous privilégions la qualité à la quantité."
              },
              {
                q: "Que comprend l'accès libre ?",
                a: "L'accès libre inclut le baromètre mensuel CEEAC, 2-3 articles par numéro, l'agenda des événements et l'annuaire des acteurs économiques."
              },
              {
                q: "Que comprend l'accès premium ?",
                a: "L'accès premium donne accès aux dossiers complets, aux archives du magazine, aux analyses pays détaillées, aux tribunes exclusives et à l'espace investisseurs."
              },
              {
                q: "Comment fonctionne le paiement ?",
                a: "Les paiements sont traités de manière sécurisée par Stripe. Vous pouvez payer par carte bancaire. L'abonnement est renouvelé automatiquement et peut être annulé à tout moment."
              },
              {
                q: "Puis-je annuler mon abonnement ?",
                a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace membre. L'accès premium reste actif jusqu'à la fin de la période en cours."
              },
              {
                q: "Quelle est la différence entre Premium et Intégral ?",
                a: "L'offre Premium donne accès à tout le contenu du site. L'offre Intégral inclut en plus la newsletter premium hebdomadaire avec des analyses approfondies et des données exclusives."
              },
            ].map((faq, i) => (
              <div key={i} className="border border-border rounded-lg p-6">
                <h3 className="font-serif font-bold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
