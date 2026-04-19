import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Handshake, FileText, ArrowRight, Mail, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

type Category = "communique" | "sponsored" | "report";

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
  const { data: items, isLoading } = trpc.partners.list.useQuery({ category: activeTab, limit: 40 });

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
                onClick={() => setActiveTab(tab.id)}
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
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-20">
              <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">Aucun contenu disponible dans cette catégorie.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item: any) => {
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
          )}
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-primary mb-3">Vous souhaitez publier un contenu partenaire ?</h2>
          <p className="text-muted-foreground font-sans mb-6 max-w-lg mx-auto">
            Communiqués de presse, publi-reportages, rapports d'études — contactez notre régie publicitaire pour diffuser votre contenu auprès des décideurs d'Afrique Centrale.
          </p>
          <a href="mailto:partenaires@habarimag.com">
            <Button type="button" className="font-sans bg-primary hover:bg-primary/90">
              <Mail className="w-4 h-4 mr-2" /> Nous contacter
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
