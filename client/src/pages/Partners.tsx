import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Handshake, FileText, ArrowRight, Mail, Loader2, X, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Category = "communique" | "sponsored" | "report";

const LIMIT = 20;

const tabs: { id: Category; label: string; icon: typeof Megaphone }[] = [
  { id: "communique", label: "Communiqués", icon: Megaphone },
  { id: "sponsored", label: "Contenus sponsorisés", icon: Handshake },
  { id: "report", label: "Rapports & études", icon: FileText },
];

function formatDate(value: any): string {
  if (!value) return "";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
  } catch {
    return "";
  }
}

export default function Partners() {
  const [activeTab, setActiveTab] = useState<Category>("communique");
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "Partenariat Habari Mag", message: "" });
  const [contactDone, setContactDone] = useState(false);
  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => setContactDone(true),
    onError: (e) => toast.error(e.message || "Erreur lors de l'envoi"),
  });

  const { isFetching, data: pageData } = trpc.partners.list.useQuery(
    { category: activeTab, limit: LIMIT, offset }
  );

  useEffect(() => {
    if (!pageData) return;
    if (offset === 0) {
      setAllItems(pageData);
    } else {
      setAllItems((prev) => [...prev, ...pageData]);
    }
    setHasMore(pageData.length === LIMIT);
  }, [pageData, offset]);

  const handleTabChange = (tab: Category) => {
    setActiveTab(tab);
    setOffset(0);
    setAllItems([]);
    setHasMore(true);
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + LIMIT);
  };

  const isInitialLoading = isFetching && offset === 0 && allItems.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Écosystème</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Contenus Partenaires</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Communiqués de presse, contenus sponsorisés et rapports d'institutions partenaires de l'écosystème économique d'Afrique Centrale.
          </p>
        </div>
      </section>

      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-3">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-sans font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isInitialLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-20">
              <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">Aucun contenu disponible dans cette catégorie.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allItems.map((item: any) => {
                  const href = item.externalLink || `#`;
                  const isExternal = !!item.externalLink;
                  return (
                    <Card key={item.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {item.tag && <span className="text-xs font-sans font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">{item.tag}</span>}
                          <span className="text-xs font-sans text-muted-foreground">{formatDate(item.publishedAt ?? item.createdAt)}</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-foreground mb-2 line-clamp-2">{item.title}</h3>
                        {item.excerpt && <p className="text-sm text-muted-foreground font-sans line-clamp-3 mb-4">{item.excerpt}</p>}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          {item.source ? (
                            <span className="text-xs font-sans text-muted-foreground">
                              Source : <span className="font-medium text-foreground">{item.source}</span>
                            </span>
                          ) : <span />}
                          {isExternal ? (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                              <Button type="button" variant="ghost" size="sm" className="font-sans text-primary gap-1 p-0 h-auto">
                                Lire <ArrowRight className="w-3 h-3" />
                              </Button>
                            </a>
                          ) : (
                            <Button type="button" variant="ghost" size="sm" className="font-sans text-primary gap-1 p-0 h-auto">
                              Lire <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    className="font-sans px-8"
                  >
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Voir plus
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-primary mb-3">Vous souhaitez publier un contenu partenaire ?</h2>
          <p className="text-muted-foreground font-sans mb-6 max-w-lg mx-auto">
            Communiqués de presse, publi-reportages, rapports d'études — contactez notre régie publicitaire pour diffuser votre contenu auprès des décideurs d'Afrique Centrale.
          </p>
          <Button type="button" onClick={() => setShowContact(true)} className="font-sans bg-primary hover:bg-primary/90">
            <Mail className="w-4 h-4 mr-2" /> Nous contacter
          </Button>
        </div>
      </section>

      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowContact(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Fermer" onClick={() => setShowContact(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-foreground mb-1">Publier un contenu partenaire</h3>
            <p className="text-sm text-muted-foreground font-sans mb-6">Notre équipe vous répondra sous 48h.</p>
            {contactDone ? (
              <div className="text-center py-8">
                <p className="text-green-600 font-sans font-semibold mb-2">✓ Message envoyé !</p>
                <p className="text-sm text-muted-foreground font-sans">Nous vous répondrons dans les meilleurs délais.</p>
                <Button type="button" variant="outline" className="mt-4 font-sans" onClick={() => { setContactDone(false); setShowContact(false); }}>Fermer</Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); contactMutation.mutate({ ...contactForm, category: "partnership" }); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-foreground mb-1">Nom *</label>
                    <input type="text" required minLength={2} placeholder="Votre nom" value={contactForm.name}
                      onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-foreground mb-1">Email *</label>
                    <input type="email" required placeholder="votre@email.com" value={contactForm.email}
                      onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-foreground mb-1">Sujet *</label>
                  <input type="text" required minLength={5} placeholder="Sujet de votre demande" value={contactForm.subject}
                    onChange={(e) => setContactForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-foreground mb-1">Message *</label>
                  <textarea required minLength={20} rows={4} value={contactForm.message}
                    onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Décrivez votre projet partenaire..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <Button type="submit" disabled={contactMutation.isPending} className="w-full font-sans bg-primary hover:bg-primary/90">
                  {contactMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Envoyer
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
