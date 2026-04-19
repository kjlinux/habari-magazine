import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { trpc } from "@/lib/trpc";
import { SECTORS, COUNTRIES_CEEAC } from "@/lib/constants";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import {
  User,
  Mail,
  Bookmark,
  CreditCard,
  Crown,
  Calendar,
  LogOut,
  Settings,
  Bell,
  BookOpen,
  Star,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  X,
  Save,
  Phone,
  Briefcase,
  Building2,
  Globe2,
  BarChart3,
  KeyRound,
  Lock,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  getPushPermissionState,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentPushSubscription,
} from "@/lib/pushNotifications";

function ChangePasswordForm() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!currentPw.trim()) { setError("Veuillez saisir votre mot de passe actuel."); return; }
    if (newPw.length < 8) { setError("Le nouveau mot de passe doit contenir au moins 8 caractères."); return; }
    if (newPw !== confirmPw) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du changement de mot de passe.");
      }
      setSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast.success("Mot de passe modifié avec succès.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="current-pw" className="font-sans text-sm flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Mot de passe actuel
        </Label>
        <Input id="current-pw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className="font-sans" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-pw" className="font-sans text-sm flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Nouveau mot de passe
        </Label>
        <Input id="new-pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} className="font-sans" />
        <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-pw" className="font-sans text-sm flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Confirmer
        </Label>
        <Input id="confirm-pw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required minLength={8} className="font-sans" />
      </div>
      {error && <p className="text-sm text-destructive font-sans">{error}</p>}
      {success && <p className="text-sm text-green-700 font-sans flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Mot de passe modifié.</p>}
      <Button type="submit" className="font-sans bg-primary hover:bg-primary/90" disabled={loading} size="sm">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Modifier le mot de passe"}
      </Button>
    </form>
  );
}

export default function MyAccount() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Profile data
  const profileQuery = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobFunction, setJobFunction] = useState("");
  const [organization, setOrganization] = useState("");
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");

  // Decode punycode email (e.g. xn--gmail-vqa.com → gmail.com)
  const decodeEmail = (raw: string) => {
    try {
      return raw.replace(/xn--[a-z0-9-]+/gi, (part) => {
        try { return new URL(`https://${part}`).hostname; } catch { return part; }
      });
    } catch { return raw; }
  };

  // Populate form when profile loads
  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data;
      setFirstName(p.firstName || "");
      setLastName(p.lastName || "");
      setEmail(p.email || "");
      setPhone(p.phone || "");
      setJobFunction(p.jobFunction || "");
      setOrganization(p.organization || "");
      setCountry(p.country || "");
      setSector(p.sector || "");
      // Load saved notification prefs
      if (p.notifNewsletter !== undefined) setNotifNewsletter(p.notifNewsletter ?? true);
      if (p.notifNewArticles !== undefined) setNotifNewArticles(p.notifNewArticles ?? true);
      if (p.notifInvestments !== undefined) setNotifInvestments(p.notifInvestments ?? false);
      if (p.notifTenders !== undefined) setNotifTenders(p.notifTenders ?? false);
      if (p.notifEvents !== undefined) setNotifEvents(p.notifEvents ?? true);
    }
  }, [profileQuery.data]);

  // Update mutation
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès.");
      setEditing(false);
      profileQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la mise à jour du profil.");
    },
  });

  const subscriptionQuery = trpc.subscriptions.userPlan.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Notification preferences state (loaded from profile)
  const [notifNewsletter, setNotifNewsletter] = useState(true);
  const [notifNewArticles, setNotifNewArticles] = useState(true);
  const [notifInvestments, setNotifInvestments] = useState(false);
  const [notifTenders, setNotifTenders] = useState(false);
  const [notifEvents, setNotifEvents] = useState(true);

  const updateNotifMutation = trpc.profile.updateNotifications.useMutation({
    onSuccess: () => toast.success("Préférences de notification enregistrées"),
    onError: () => toast.error("Erreur lors de la sauvegarde des notifications"),
  });

  const saveNotif = (key: string, value: boolean) => {
    const prefs = {
      notifNewsletter,
      notifNewArticles,
      notifInvestments,
      notifTenders,
      notifEvents,
      [key]: value,
    };
    updateNotifMutation.mutate(prefs);
  };

  // Push subscription state
  const [pushState, setPushState] = useState<"granted" | "denied" | "default" | "unsupported">("default");
  const [pushActive, setPushActive] = useState(false);
  const pushChecked = useRef(false);

  const vapidQuery = trpc.profile.getVapidKey.useQuery(undefined, { enabled: isAuthenticated });
  const savePushSub = trpc.profile.savePushSubscription.useMutation();
  const removePushSub = trpc.profile.removePushSubscription.useMutation();

  useEffect(() => {
    if (!isAuthenticated || pushChecked.current) return;
    pushChecked.current = true;
    getPushPermissionState().then(async (state) => {
      if (!("serviceWorker" in navigator)) { setPushState("unsupported"); return; }
      setPushState(state);
      const sub = await getCurrentPushSubscription();
      setPushActive(!!sub);
      if (state === "default" && vapidQuery.data?.publicKey) {
        subscribeToPush(vapidQuery.data.publicKey, async (s) => {
          await savePushSub.mutateAsync(s);
          setPushActive(true);
          setPushState("granted");
        });
      }
    });
  }, [isAuthenticated, vapidQuery.data]);

  const togglePush = async () => {
    if (pushActive) {
      await unsubscribeFromPush(async (endpoint) => { await removePushSub.mutateAsync({ endpoint }); });
      setPushActive(false);
    } else if (vapidQuery.data?.publicKey) {
      const ok = await subscribeToPush(vapidQuery.data.publicKey, async (s) => {
        await savePushSub.mutateAsync(s);
      });
      if (ok) { setPushActive(true); setPushState("granted"); }
      else setPushState("denied");
    }
  };

  const { data: savedArticles } = trpc.profile.savedArticles.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cancelMutation = trpc.stripe.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Votre abonnement a été annulé avec succès.");
      subscriptionQuery.refetch();
      setCancelLoading(false);
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation. Veuillez réessayer.");
      setCancelLoading(false);
    },
  });

  const handleCancelEdit = () => {
    // Reset to original values
    if (profileQuery.data) {
      const p = profileQuery.data;
      setFirstName(p.firstName || "");
      setLastName(p.lastName || "");
      setEmail(p.email || "");
      setPhone(p.phone || "");
      setJobFunction(p.jobFunction || "");
      setOrganization(p.organization || "");
      setCountry(p.country || "");
      setSector(p.sector || "");
    }
    setEditing(false);
  };

  const handleSaveProfile = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !jobFunction.trim() || !organization.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-muted/30">
          <div className="container py-20">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-primary mb-4">Mon espace</h1>
              <p className="text-muted-foreground font-sans mb-8">
                Connectez-vous pour accéder à votre espace personnel, gérer votre abonnement et consulter votre historique.
              </p>
              <a href={"/login"}>
                <Button size="lg" className="font-sans bg-primary hover:bg-primary/90">
                  Se connecter
                </Button>
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const profile = profileQuery.data;
  const subscription = subscriptionQuery.data;
  const tierLabels: Record<string, string> = {
    free: "Accès libre",
    premium: "Premium",
    integral: "Habari Intégral",
  };
  const currentTier = (user as any)?.subscriptionTier || "free";
  const isPremium = currentTier === "premium" || currentTier === "integral";
  const isPaid = currentTier !== "free";
  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : user?.name || "Membre Habari";
  const initials = profile?.firstName && profile?.lastName
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : user?.name?.charAt(0)?.toUpperCase() || "H";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-primary text-white">
          <div className="container py-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                <span className="font-serif text-3xl font-bold">{initials}</span>
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold mb-1">{displayName}</h1>
                <p className="text-white/70 font-sans text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {decodeEmail(profile?.email || user?.email || "—")}
                </p>
                {profile?.jobFunction && profile?.organization && (
                  <p className="text-white/50 font-sans text-sm flex items-center gap-2 mt-1">
                    <Briefcase className="w-4 h-4" /> {profile.jobFunction} — {profile.organization}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold ${
                    isPremium ? "bg-[oklch(0.72_0.15_75)] text-[oklch(0.20_0.02_250)]" : "bg-white/20 text-white"
                  }`}>
                    {isPremium ? <Crown className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                    {tierLabels[currentTier] || "Accès libre"}
                  </span>
                  {user?.role === "admin" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-red-500/20 text-white">
                      Admin
                    </span>
                  )}
                  {profile?.profileCompleted && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-green-500/20 text-white">
                      <CheckCircle2 className="w-3 h-3" /> Profil complet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Profile & Actions */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Informations personnelles
                  </h2>
                  {!editing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-sans text-xs gap-1.5"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-sans text-xs gap-1 text-muted-foreground"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-3.5 h-3.5" /> Annuler
                      </Button>
                      <Button
                        size="sm"
                        className="font-sans text-xs gap-1 bg-primary"
                        onClick={handleSaveProfile}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Enregistrer
                      </Button>
                    </div>
                  )}
                </div>

                {profileQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : editing ? (
                  /* ===== EDIT MODE ===== */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" /> Nom <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Dupont"
                          className="font-sans text-sm h-9"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" /> Prénom <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jean"
                          className="font-sans text-sm h-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jean@example.com"
                        className="font-sans text-sm h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> WhatsApp <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                        className="font-sans text-sm h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Fonction <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={jobFunction}
                        onChange={(e) => setJobFunction(e.target.value)}
                        placeholder="Directeur Général"
                        className="font-sans text-sm h-9"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Organisation <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Banque Centrale"
                        className="font-sans text-sm h-9"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                          <Globe2 className="w-3 h-3" /> Pays
                        </Label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors font-sans focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">—</option>
                          {COUNTRIES_CEEAC.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" /> Secteur
                        </Label>
                        <select
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors font-sans focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">—</option>
                          {SECTORS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-sans pt-1">
                      Les champs marqués d'un <span className="text-destructive">*</span> sont obligatoires.
                    </p>
                  </div>
                ) : (
                  /* ===== VIEW MODE ===== */
                  <div className="space-y-3.5">
                    <ProfileField
                      icon={<User className="w-3.5 h-3.5" />}
                      label="Nom"
                      value={profile?.lastName || user?.name?.split(" ").slice(-1)[0] || "Non renseigné"}
                    />
                    <ProfileField
                      icon={<User className="w-3.5 h-3.5" />}
                      label="Prénom"
                      value={profile?.firstName || user?.name?.split(" ")[0] || "Non renseigné"}
                    />
                    <ProfileField
                      icon={<Mail className="w-3.5 h-3.5" />}
                      label="Email"
                      value={decodeEmail(profile?.email || user?.email || "Non renseigné")}
                    />
                    <ProfileField
                      icon={<Phone className="w-3.5 h-3.5" />}
                      label="WhatsApp"
                      value={profile?.phone || "Non renseigné"}
                    />
                    <ProfileField
                      icon={<Briefcase className="w-3.5 h-3.5" />}
                      label="Fonction"
                      value={profile?.jobFunction || "Non renseigné"}
                    />
                    <ProfileField
                      icon={<Building2 className="w-3.5 h-3.5" />}
                      label="Organisation"
                      value={profile?.organization || "Non renseigné"}
                    />
                    <ProfileField
                      icon={<Globe2 className="w-3.5 h-3.5" />}
                      label="Pays"
                      value={profile?.country || "Non renseigné"}
                    />
                    <ProfileField
                      icon={<BarChart3 className="w-3.5 h-3.5" />}
                      label="Secteur"
                      value={profile?.sector || "Non renseigné"}
                    />
                    <div className="pt-2 border-t border-border/50">
                      <ProfileField
                        icon={<Calendar className="w-3.5 h-3.5" />}
                        label="Membre depuis"
                        value={
                          profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"
                        }
                      />
                    </div>

                    {!profile?.profileCompleted && (
                      <div className="mt-3 p-3 rounded-lg bg-[oklch(0.72_0.15_75)]/10 border border-[oklch(0.72_0.15_75)]/20">
                        <p className="text-xs font-sans text-muted-foreground mb-2">
                          Complétez votre profil pour accéder à tous les contenus premium.
                        </p>
                        <Button
                          size="sm"
                          className="font-sans text-xs bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)]"
                          onClick={() => setEditing(true)}
                        >
                          <Pencil className="w-3 h-3 mr-1.5" /> Compléter mon profil
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-primary mb-4">Actions rapides</h2>
                <div className="space-y-2">
                  <Link href="/magazine">
                    <Button variant="outline" className="w-full justify-start font-sans text-sm">
                      <BookOpen className="w-4 h-4 mr-2" /> Consulter le magazine
                    </Button>
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" className="w-full justify-start font-sans text-sm text-primary">
                        <Settings className="w-4 h-4 mr-2" /> Panneau d'administration
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start font-sans text-sm text-destructive hover:text-destructive"
                    onClick={() => {
                      logout();
                      toast.success("Vous avez été déconnecté.");
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
                  </Button>
                </div>
              </div>

              {/* Change Password Section */}
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <KeyRound className="w-5 h-5" /> Changer le mot de passe
                </h2>
                <ChangePasswordForm />
              </div>
            </div>

            {/* Right column - Subscription & Features */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Card */}
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-primary mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Mon abonnement
                </h2>

                <div className={`rounded-lg p-6 mb-6 ${
                  isPremium
                    ? "bg-gradient-to-r from-[oklch(0.72_0.15_75)]/10 to-primary/5 border border-[oklch(0.72_0.15_75)]/30"
                    : "bg-muted/50 border border-border"
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {isPremium ? (
                          <Crown className="w-6 h-6 text-[oklch(0.72_0.15_75)]" />
                        ) : (
                          <Star className="w-6 h-6 text-muted-foreground" />
                        )}
                        <h3 className="font-serif text-xl font-bold">
                          {tierLabels[currentTier] || "Accès libre"}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground font-sans">
                        {isPremium
                          ? "Vous bénéficiez d'un accès complet à tous les contenus et services Habari."
                          : "Vous avez accès aux articles en accès libre et au baromètre mensuel."}
                      </p>
                    </div>
                    {!isPremium && (
                      <Link href="/abonnements">
                        <Button className="font-sans bg-primary hover:bg-primary/90 shrink-0">
                          Passer Premium <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  {subscription && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-4 text-sm font-sans">
                        <div>
                          <span className="text-muted-foreground">Statut</span>
                          <p className="font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600" /> Actif
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prochain renouvellement</span>
                          <p className="font-medium mt-0.5">
                            {subscription.endDate
                              ? new Date(subscription.endDate).toLocaleDateString("fr-FR")
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features included */}
                <div className="mb-6">
                  <h3 className="font-sans text-sm font-semibold text-foreground/80 uppercase tracking-wider mb-3">
                    Fonctionnalités incluses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <FeatureItem included label="Baromètre économique mensuel" />
                    <FeatureItem included label="2-3 articles par numéro" />
                    <FeatureItem included label="Agenda des événements" />
                    <FeatureItem included label="Newsletter hebdomadaire" />
                    <FeatureItem included={isPremium} label="Dossiers complets" />
                    <FeatureItem included={isPremium} label="Archives complètes" />
                    <FeatureItem included={isPremium} label="Analyses pays détaillées" />
                    <FeatureItem included={isPremium} label="Tribunes et interviews exclusives" />
                    <FeatureItem included={isPremium} label="Newsletter premium" />
                    <FeatureItem included={isPremium} label="Annuaire complet" />
                  </div>
                </div>

                {/* Upgrade or Cancel */}
                <div className="flex flex-wrap gap-3">
                  {!isPremium && (
                    <Link href="/abonnements">
                      <Button className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.20_0.02_250)] hover:bg-[oklch(0.72_0.15_75)]/90">
                        <Crown className="w-4 h-4 mr-2" /> Passer à Premium — 4,50 €/mois
                      </Button>
                    </Link>
                  )}
                  {isPremium && subscription?.stripeSubscriptionId && (
                    <Button
                      variant="outline"
                      className="font-sans text-destructive border-destructive/30 hover:bg-destructive/5"
                      disabled={cancelLoading}
                      onClick={() => {
                        if (confirm("Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez l'accès aux contenus premium.")) {
                          setCancelLoading(true);
                          cancelMutation.mutate({ subscriptionId: subscription.stripeSubscriptionId! });
                        }
                      }}
                    >
                      {cancelLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      Annuler l'abonnement
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications preferences */}
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Préférences de notification
                </h2>
                <div className="space-y-4">
                  <NotifToggle label="Newsletter hebdomadaire" desc="Résumé de l'actualité CEEAC chaque semaine" value={notifNewsletter} onChange={(v) => { setNotifNewsletter(v); saveNotif("notifNewsletter", v); }} />
                  <NotifToggle label="Nouveaux articles" desc="Notification lors de la publication de nouveaux contenus" value={notifNewArticles} onChange={(v) => { setNotifNewArticles(v); saveNotif("notifNewArticles", v); }} />
                  <NotifToggle
                    label="Alertes investissements"
                    desc={isPaid ? "Nouvelles opportunités d'investissement" : "Réservé aux abonnés — Passez à Standard ou Premium"}
                    value={notifInvestments}
                    onChange={(v) => { if (!isPaid) return; setNotifInvestments(v); saveNotif("notifInvestments", v); }}
                    locked={!isPaid}
                  />
                  <NotifToggle
                    label="Appels d'offres"
                    desc={isPaid ? "Nouveaux appels d'offres dans votre secteur" : "Réservé aux abonnés — Passez à Standard ou Premium"}
                    value={notifTenders}
                    onChange={(v) => { if (!isPaid) return; setNotifTenders(v); saveNotif("notifTenders", v); }}
                    locked={!isPaid}
                  />
                  <NotifToggle
                    label="Événements"
                    desc={isPaid ? "Rappels pour les événements à venir" : "Réservé aux abonnés — Passez à Standard ou Premium"}
                    value={notifEvents}
                    onChange={(v) => { if (!isPaid) return; setNotifEvents(v); saveNotif("notifEvents", v); }}
                    locked={!isPaid}
                  />
                </div>
                {/* Push browser */}
                <div className="mt-4 pt-4 border-t border-border">
                  {!isPaid ? (
                    <div className="flex items-center justify-between opacity-60">
                      <div>
                        <p className="font-sans text-sm font-medium text-foreground flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> Notifications push (navigateur)
                        </p>
                        <p className="font-sans text-xs text-muted-foreground mt-0.5">Réservé aux abonnés — Passez à Standard ou Premium</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted cursor-not-allowed">
                        <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white shadow" />
                      </div>
                    </div>
                  ) : pushState !== "unsupported" ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-sm font-medium text-foreground">Notifications push (navigateur)</p>
                        <p className="font-sans text-xs text-muted-foreground mt-0.5">
                          {pushState === "denied" ? "Permission refusée par le navigateur" : pushActive ? "Activées sur cet appareil" : "Désactivées sur cet appareil"}
                        </p>
                      </div>
                      {pushState !== "denied" && (
                        <button
                          onClick={togglePush}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${pushActive ? "bg-primary" : "bg-muted"}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${pushActive ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
                {!isPaid && (
                  <div className="mt-3 p-3 rounded-lg bg-[oklch(0.72_0.15_75)]/10 border border-[oklch(0.72_0.15_75)]/20">
                    <p className="text-xs font-sans text-[oklch(0.45_0.10_75)]">
                      <Crown className="w-3 h-3 inline mr-1" />
                      Abonnez-vous pour accéder aux alertes investissements, appels d'offres, événements et notifications push.{" "}
                      <Link href="/abonnements" className="underline font-semibold">Voir les offres →</Link>
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground font-sans mt-3">
                  Vos préférences sont sauvegardées automatiquement.
                </p>
              </div>

              {/* Saved articles */}
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5" /> Articles sauvegardés
                </h2>
                {!savedArticles || savedArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-sans">Aucun article sauvegardé pour l'instant.</p>
                ) : (
                  <div className="space-y-3">
                    {savedArticles.map((a) => (
                      <Link key={a.id} href={`/article/${a.slug}`}>
                        <div className="flex gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer group">
                          {a.featuredImage && (
                            <img src={a.featuredImage} alt="" className="w-14 h-14 rounded-md object-cover shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-serif text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
                            {a.publishedAt && (
                              <p className="font-sans text-xs text-muted-foreground mt-0.5">
                                {new Date(a.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity */}
              <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Activité récente
                </h2>
                <div className="space-y-3">
                  <ActivityItem
                    icon={<User className="w-4 h-4" />}
                    label="Connexion au compte"
                    date={user?.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  />
                  <ActivityItem
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Compte créé"
                    date={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

/* ===== Sub-components ===== */

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const isEmpty = value === "Non renseigné";
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-md bg-primary/5 flex items-center justify-center text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`font-sans text-sm font-medium mt-0.5 ${isEmpty ? "text-muted-foreground/50 italic" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ included, label }: { included: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm font-sans ${included ? "text-foreground" : "text-muted-foreground/50"}`}>
      {included ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
      )}
      {label}
    </div>
  );
}

function NotifToggle({ label, desc, value, onChange, locked }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void; locked?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2 ${locked ? "opacity-50" : ""}`}>
      <div>
        <p className="font-sans text-sm font-medium flex items-center gap-1.5">
          {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
          {label}
        </p>
        <p className="font-sans text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => !locked && onChange(!value)}
        disabled={locked}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          locked ? "cursor-not-allowed bg-muted-foreground/10" : value ? "bg-primary" : "bg-muted-foreground/20"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            value && !locked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function ActivityItem({ icon, label, date }: { icon: React.ReactNode; label: string; date: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-medium">{label}</p>
        <p className="font-sans text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
