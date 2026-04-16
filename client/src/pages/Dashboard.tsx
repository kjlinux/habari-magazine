import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

import { Loader2, LogOut, Bell, Bookmark, MessageSquare, Settings, Eye, Heart, ArrowRight, Download, FileText, Trash2, Plus, Check } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tabs = [
  { id: "overview", label: "Vue d'ensemble", icon: Eye },
  { id: "downloads", label: "Téléchargements", icon: Download },
  { id: "favorites", label: "Favoris", icon: Bookmark },
  { id: "alerts", label: "Alertes", icon: Bell },
  { id: "settings", label: "Paramètres", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Dashboard() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { data: userPlan, isLoading: planLoading } = trpc.subscriptions.userPlan.useQuery();
  const { data: purchases, isLoading: purchasesLoading } = trpc.magazine.myPurchases.useQuery(undefined, { enabled: isAuthenticated });
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
              <a href={"/login"}>
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

          {activeTab === "downloads" && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-xl text-foreground">Mes téléchargements</h2>
              {purchasesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : !purchases || purchases.length === 0 ? (
                <Card className="border shadow-sm">
                  <CardContent className="p-8 text-center">
                    <Download className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-serif font-bold text-lg text-foreground mb-2">Aucun achat</h3>
                    <p className="text-muted-foreground font-sans mb-4">Vous n'avez pas encore acheté de numéro à l'unité.</p>
                    <Link href="/telecharger">
                      <Button className="font-sans bg-primary hover:bg-primary/90">Parcourir les numéros</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {purchases.map((p: any) => (
                    <Card key={p.id} className="border shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans font-medium text-sm truncate">{p.issueTitle || `Numéro ${p.issueNumber}`}</p>
                            <p className="text-xs text-muted-foreground font-sans mt-0.5">
                              Acheté le {p.paidAt ? new Date(p.paidAt).toLocaleDateString("fr-FR") : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground font-sans">{p.amount ? `${(p.amount / 100).toFixed(2)} €` : ""}</p>
                          </div>
                        </div>
                        {p.pdfUrl && (
                          <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-3 w-full">
                            <Button size="sm" variant="outline" className="font-sans w-full gap-2 text-xs">
                              <Download className="w-3 h-3" /> Télécharger le PDF
                            </Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="pt-2">
                <Link href="/telecharger">
                  <Button variant="outline" className="font-sans gap-2"><ArrowRight className="w-4 h-4" /> Tous les numéros disponibles</Button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-xl text-foreground">Mes favoris</h2>
              <Card className="border shadow-sm">
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-serif font-bold text-lg text-foreground mb-2">Vos favoris</h3>
                  <p className="text-muted-foreground font-sans mb-4">
                    Cliquez sur le bouton <Heart className="w-3.5 h-3.5 inline" /> sur un article ou une opportunité pour l'ajouter à vos favoris.
                  </p>
                  <Link href="/magazine">
                    <Button variant="outline" className="font-sans">Parcourir le magazine</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-xl text-foreground">Mes alertes</h2>
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Bell className="w-8 h-8 text-primary/50 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-serif font-bold text-lg text-foreground mb-1">Alertes personnalisées</h3>
                      <p className="text-muted-foreground font-sans text-sm">Recevez une notification dès qu'un nouvel article, investissement ou appel d'offres correspond à vos critères.</p>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border">
                    <p className="text-sm font-sans font-medium text-foreground">Créer une alerte</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-sans text-muted-foreground">Type de contenu</label>
                        <select className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background" title="Type de contenu">
                          <option value="article">Articles</option>
                          <option value="investment">Investissements</option>
                          <option value="bid">Appels d'offres</option>
                          <option value="event">Événements</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-sans text-muted-foreground">Mots-clés</label>
                        <input type="text" placeholder="ex: énergie, finance verte..." className="w-full border border-input rounded-md px-3 py-2 text-sm font-sans bg-background" />
                      </div>
                    </div>
                    <Button className="font-sans bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
                      <Plus className="w-4 h-4" /> Créer l'alerte
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans mt-4">La gestion complète des alertes sera disponible prochainement.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === ("messages" as string) && (
            <Card className="border shadow-sm">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">Messagerie</h3>
                <p className="text-muted-foreground font-sans mb-4">Fonctionnalité disponible prochainement.</p>
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
