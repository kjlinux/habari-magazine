import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Loader2,
  Gift,
  Clock,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Globe2,
  Sparkles,
  Shield,
  BookOpen,
  BarChart3,
  Users,
  ArrowRight,
} from "lucide-react";

import { SECTORS, COUNTRIES_CEEAC } from "@/lib/constants";

export default function Registration() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobFunction, setJobFunction] = useState("");
  const [organization, setOrganization] = useState("");
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Launch status
  const launchQuery = trpc.magazine.launchStatus.useQuery();

  // Profile check
  const profileQuery = trpc.profile.isCompleted.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Profile data (to pre-fill if exists)
  const profileData = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Update mutation
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Inscription complétée avec succès ! Bienvenue dans la communauté Habari.");
      navigate("/espace-membre");
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de l'inscription. Veuillez réessayer.");
      setSubmitting(false);
    },
  });

  // Pre-fill form with existing data
  useEffect(() => {
    if (profileData.data) {
      const p = profileData.data;
      if (p.firstName) setFirstName(p.firstName);
      if (p.lastName) setLastName(p.lastName);
      if (p.email) setEmail(p.email);
      if (p.phone) setPhone(p.phone);
      if (p.jobFunction) setJobFunction(p.jobFunction);
      if (p.organization) setOrganization(p.organization);
      if (p.country) setCountry(p.country);
      if (p.sector) setSector(p.sector);
    } else if (user) {
      // Pre-fill email from OAuth
      if (user.email && !email) setEmail(user.email);
      // Try to split name
      if (user.name && !firstName && !lastName) {
        const parts = user.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(" "));
        } else if (parts.length === 1) {
          setLastName(parts[0]);
        }
      }
    }
  }, [profileData.data, user]);

  // If profile already completed, redirect
  useEffect(() => {
    if (profileQuery.data?.completed) {
      navigate("/espace-membre");
    }
  }, [profileQuery.data, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !jobFunction.trim() || !organization.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSubmitting(true);
    updateProfile.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      jobFunction: jobFunction.trim(),
      organization: organization.trim(),
      country: country || undefined,
      sector: sector || undefined,
    });
  };

  const daysRemaining = launchQuery.data?.daysRemaining ?? 0;

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  // Not authenticated — show promo page with login CTA
  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          {/* Hero promo */}
          <section className="relative py-20 bg-gradient-to-br from-primary via-[oklch(0.35_0.10_250)] to-[oklch(0.20_0.05_250)] overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[oklch(0.72_0.15_75)] blur-3xl" />
              <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary blur-3xl" />
            </div>
            <div className="container relative text-center">
              <div className="inline-flex items-center gap-2 bg-[oklch(0.72_0.15_75)]/20 text-[oklch(0.90_0.08_75)] px-4 py-2 rounded-full text-sm font-sans font-semibold mb-6">
                <Gift className="w-4 h-4" />
                Offre de lancement — Accès gratuit
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 max-w-3xl mx-auto leading-tight">
                Accédez gratuitement à tout le contenu premium Habari
              </h1>
              <p className="text-lg text-white/70 font-sans max-w-2xl mx-auto mb-4">
                Jusqu'au <strong className="text-[oklch(0.85_0.12_75)]">1er juin 2026</strong>, tout le contenu premium est accessible gratuitement pour les inscrits. Analyses économiques, données exclusives, annuaire des acteurs de la zone CEEAC.
              </p>
              {daysRemaining > 0 && (
                <div className="inline-flex items-center gap-2 text-[oklch(0.90_0.08_75)] text-sm font-sans mb-8">
                  <Clock className="w-4 h-4" />
                  Plus que <strong>{daysRemaining} jours</strong> pour profiter de l'offre
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="font-sans gap-2 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] font-semibold text-base px-8">
                    <Gift className="w-5 h-5" /> S'inscrire gratuitement
                  </Button>
                </a>
              </div>
              <p className="text-xs text-white/40 font-sans mt-4">
                Inscription rapide via votre compte Manus. Aucun paiement requis.
              </p>
            </div>
          </section>

          {/* Avantages */}
          <section className="py-16">
            <div className="container">
              <h2 className="font-serif text-2xl font-bold text-primary text-center mb-2">
                Ce que vous obtenez gratuitement
              </h2>
              <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mx-auto mb-10"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  { icon: BookOpen, title: "Articles premium", desc: "Analyses approfondies, dossiers exclusifs et interviews de décideurs de la zone CEEAC." },
                  { icon: BarChart3, title: "Données économiques", desc: "Baromètre économique, indicateurs clés et tendances des 11 pays membres." },
                  { icon: Users, title: "Annuaire des acteurs", desc: "Répertoire des entreprises, investisseurs et institutions de l'Afrique Centrale." },
                ].map((item, i) => (
                  <Card key={i} className="border-0 shadow-sm text-center p-6">
                    <CardContent className="p-0">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[oklch(0.72_0.15_75)]/10 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-[oklch(0.72_0.15_75)]" />
                      </div>
                      <h3 className="font-serif font-bold text-lg text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-sans">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA final */}
          <section className="py-14 bg-[oklch(0.97_0.005_250)]">
            <div className="container text-center">
              <p className="text-muted-foreground font-sans mb-6">
                Rejoignez déjà des centaines de professionnels et décideurs inscrits sur Habari Magazine.
              </p>
              <a href={getLoginUrl()}>
                <Button size="lg" className="font-sans gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  <ArrowRight className="w-5 h-5" /> Créer mon compte gratuit
                </Button>
              </a>
            </div>
          </section>
        </div>
        <Footer />
      </>
    );
  }

  // Authenticated — show the profile form
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-12 bg-gradient-to-br from-primary via-[oklch(0.35_0.10_250)] to-[oklch(0.20_0.05_250)]">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-[oklch(0.72_0.15_75)]/20 text-[oklch(0.90_0.08_75)] px-4 py-2 rounded-full text-sm font-sans font-semibold mb-4">
              <Gift className="w-4 h-4" />
              Accès gratuit jusqu'au 1er juin 2026
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
              Complétez votre inscription
            </h1>
            <p className="text-white/70 font-sans max-w-xl mx-auto">
              Remplissez votre fiche pour accéder gratuitement à tout le contenu premium Habari Magazine.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="py-12">
          <div className="container max-w-2xl mx-auto px-4">
            <Card className="border-0 shadow-lg overflow-hidden">
              {/* Promo banner inside card */}
              <div className="bg-[oklch(0.72_0.15_75)]/10 border-b border-[oklch(0.72_0.15_75)]/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.72_0.15_75)]/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[oklch(0.65_0.15_75)]" />
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-sm text-foreground">Offre de lancement</p>
                    <p className="font-sans text-xs text-muted-foreground">
                      Tous les contenus premium sont gratuits jusqu'au 1er juin 2026.
                      {daysRemaining > 0 && <span className="text-[oklch(0.55_0.12_75)] font-semibold"> Plus que {daysRemaining} jours !</span>}
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nom & Prénom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="font-sans text-sm font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Nom <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Ex : Dupont"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="font-sans"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="font-sans text-sm font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Prénom <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Ex : Jean"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="font-sans"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-sans text-sm font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      Adresse email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.dupont@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>

                  {/* Téléphone WhatsApp */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-sans text-sm font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      N° de téléphone WhatsApp <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+237 6XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="font-sans"
                    />
                    <p className="text-xs text-muted-foreground font-sans">
                      Incluez l'indicatif pays (ex : +237, +33, +1)
                    </p>
                  </div>

                  {/* Fonction */}
                  <div className="space-y-2">
                    <Label htmlFor="jobFunction" className="font-sans text-sm font-medium flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                      Fonction <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="jobFunction"
                      placeholder="Ex : Directeur Général, Analyste, Consultant..."
                      value={jobFunction}
                      onChange={(e) => setJobFunction(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>

                  {/* Entreprise / Organisation */}
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="font-sans text-sm font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      Entreprise ou Organisation <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="organization"
                      placeholder="Ex : Banque Centrale, Total Energies, ONU..."
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>

                  {/* Pays & Secteur (optionnels) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country" className="font-sans text-sm font-medium flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-muted-foreground" />
                        Pays
                      </Label>
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors font-sans focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Sélectionnez...</option>
                        {COUNTRIES_CEEAC.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector" className="font-sans text-sm font-medium flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                        Secteur d'activité
                      </Label>
                      <select
                        id="sector"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors font-sans focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Sélectionnez...</option>
                        {SECTORS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Avantages recap */}
                  <div className="bg-[oklch(0.97_0.005_250)] rounded-lg p-4 space-y-2">
                    <p className="font-sans text-sm font-semibold text-foreground mb-2">En vous inscrivant, vous accédez à :</p>
                    {[
                      "Tous les articles premium et analyses exclusives",
                      "Le magazine PDF en téléchargement",
                      "Le baromètre économique de la zone CEEAC",
                      "L'annuaire des acteurs économiques",
                      "Les alertes sur les appels d'offres et investissements",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[oklch(0.55_0.15_145)] mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground font-sans">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full font-sans gap-2 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] font-semibold text-base"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Gift className="w-5 h-5" /> Compléter mon inscription gratuite
                      </>
                    )}
                  </Button>

                  {/* Privacy */}
                  <div className="flex items-start gap-2 pt-2">
                    <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground font-sans">
                      Vos données sont protégées et ne seront jamais partagées avec des tiers.
                      Habari Magazine respecte votre vie privée conformément au RGPD.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
