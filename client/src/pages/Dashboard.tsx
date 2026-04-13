import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Loader2, LogOut, Bell, Bookmark, MessageSquare, Settings, Eye, Heart, ArrowRight } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tabs = [
  { id: "overview", label: "Vue d'ensemble", icon: Eye },
  { id: "alerts", label: "Alertes", icon: Bell },
  { id: "favorites", label: "Favoris", icon: Bookmark },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Paramètres", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Dashboard() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { data: userPlan, isLoading: planLoading } = trpc.subscriptions.userPlan.useQuery();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Card className="w-full max-w-md border shadow-sm">
            <CardContent className="p-8 text-center">
              <h2 className="font-serif text-2xl font-bold text-primary mb-3">Espace réservé aux membres</h2>
              <p className="text-muted-foreground font-sans mb-6">Connectez-vous pour accéder à votre tableau de bord personnalisé.</p>
              <a href={getLoginUrl()}>
                <Button className="font-sans bg-primary hover:bg-primary/90">Se connecter <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </a>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-[oklch(0.20_0.02_250)] py-10">
        <div className="container flex items-center justify-between">
          <div>
            <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-2">Espace membre</div>
            <h1 className="font-serif text-3xl font-bold text-white">Bienvenue, {user?.name || "Membre"}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()} className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white font-sans">
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto py-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-sans font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-serif font-bold text-lg text-foreground mb-4">Profil</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Nom</span>
                        <p className="font-sans font-medium text-foreground">{user?.name || "Non renseigné"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Email</span>
                        <p className="font-sans font-medium text-foreground">{user?.email || "Non renseigné"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Rôle</span>
                        <p className="font-sans font-medium text-foreground capitalize">{user?.role || "Utilisateur"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Membre depuis</span>
                        <p className="font-sans font-medium text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" }) : "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-serif font-bold text-lg text-foreground mb-4">Abonnement</h3>
                    {planLoading ? (
                      <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : userPlan ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Plan</span>
                            <p className="font-sans font-bold text-primary capitalize">{userPlan.tier}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Statut</span>
                            <p className="font-sans font-medium text-green-600 capitalize">{userPlan.status}</p>
                          </div>
                        </div>
                        <Link href="/abonnements">
                          <Button variant="outline" size="sm" className="font-sans">Changer de plan</Button>
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground font-sans mb-4">Aucun abonnement actif.</p>
                        <Link href="/abonnements">
                          <Button className="font-sans bg-primary hover:bg-primary/90">Découvrir les plans</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border shadow-sm bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="font-serif font-bold text-foreground mb-3">Accès rapide</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Derniers articles", href: "/magazine" },
                        { label: "Annuaire économique", href: "/annuaire" },
                        { label: "Opportunités d'investissement", href: "/investisseurs" },
                        { label: "Appels d'offres", href: "/appels-offres" },
                      ].map((link) => (
                        <Link key={link.href} href={link.href}>
                          <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-primary/10 transition-colors cursor-pointer">
                            <span className="text-sm font-sans text-foreground">{link.label}</span>
                            <ArrowRight className="w-3 h-3 text-primary" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "alerts" && (
            <Card className="border shadow-sm">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">Alertes personnalisées</h3>
                <p className="text-muted-foreground font-sans mb-4">Configurez des alertes pour être notifié des nouvelles opportunités.</p>
                <Button className="font-sans bg-primary hover:bg-primary/90">Créer une alerte</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "favorites" && (
            <Card className="border shadow-sm">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">Vos favoris</h3>
                <p className="text-muted-foreground font-sans mb-4">Sauvegardez vos articles et opportunités préférés.</p>
                <Link href="/magazine">
                  <Button variant="outline" className="font-sans">Parcourir le magazine</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {activeTab === "messages" && (
            <Card className="border shadow-sm">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">Messagerie</h3>
                <p className="text-muted-foreground font-sans mb-4">Échangez avec les acteurs économiques de la zone CEEAC.</p>
                <Button className="font-sans bg-primary hover:bg-primary/90">Nouveau message</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-serif font-bold text-lg text-foreground mb-4">Paramètres du compte</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-sans font-medium text-muted-foreground">Email</label>
                      <input type="email" value={user?.email || ""} disabled className="w-full mt-1 px-3 py-2 text-sm font-sans border border-border rounded-md bg-muted/30" />
                    </div>
                    <div>
                      <label className="text-sm font-sans font-medium text-muted-foreground">Langue</label>
                      <select className="w-full mt-1 px-3 py-2 text-sm font-sans border border-border rounded-md bg-background">
                        <option>Français</option>
                        <option>English</option>
                      </select>
                    </div>
                    <Button className="font-sans bg-primary hover:bg-primary/90">Enregistrer</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
