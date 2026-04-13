import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, TrendingUp, DollarSign, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sampleInvestments = [
  { id: 1, title: "Agro-industrie — Transformation cacao", sector: "Agriculture", country: "Cameroun", amount: "5M USD", type: "equity", status: "open", desc: "Unité de transformation de fèves de cacao en beurre et poudre de cacao pour l'export." },
  { id: 2, title: "Mini-grid solaire — Zone rurale", sector: "Énergie", country: "Cameroun", amount: "2M USD", type: "debt", status: "open", desc: "Déploiement de mini-réseaux solaires dans 15 villages non connectés au réseau national." },
  { id: 3, title: "Plateforme fintech — Mobile money B2B", sector: "Services financiers", country: "Gabon", amount: "1.5M USD", type: "equity", status: "open", desc: "Solution de paiement B2B pour les PME de la zone CEEAC." },
  { id: 4, title: "Complexe hôtelier éco-responsable", sector: "Tourisme", country: "Gabon", amount: "8M USD", type: "equity", status: "open", desc: "Écolodge de 40 chambres dans le parc national de la Lopé." },
  { id: 5, title: "Cimenterie — Extension capacité", sector: "Construction", country: "Congo", amount: "15M USD", type: "debt", status: "open", desc: "Extension de la capacité de production de 500 000 à 1 million de tonnes/an." },
  { id: 6, title: "Aquaculture intensive — Tilapia", sector: "Agriculture", country: "Cameroun", amount: "3M USD", type: "equity", status: "open", desc: "Ferme aquacole moderne de 200 hectares avec unité de transformation." },
  { id: 7, title: "Exploration pétrolière offshore — Bloc 15", sector: "Énergie", country: "Angola", amount: "50M USD", type: "equity", status: "open", desc: "Participation dans un consortium d'exploration pétrolière offshore au large de Luanda." },
  { id: 8, title: "Mine de cobalt — Katanga", sector: "Industries extractives", country: "RDC", amount: "25M USD", type: "equity", status: "open", desc: "Développement d'une mine de cobalt dans la province du Haut-Katanga pour l'électromobilité." },
  { id: 9, title: "Kigali Innovation City — Tech Hub", sector: "Technologie", country: "Rwanda", amount: "10M USD", type: "equity", status: "open", desc: "Espace de co-working et incubateur technologique au cœur de Kigali Innovation City." },
  { id: 10, title: "Caféiculture durable — Ngozi", sector: "Agriculture", country: "Burundi", amount: "2M USD", type: "debt", status: "open", desc: "Modernisation de coopératives caféières et certification commerce équitable." },
  { id: 11, title: "Cacao bio premium — Export", sector: "Agriculture", country: "São Tomé-et-Príncipe", amount: "1M USD", type: "equity", status: "open", desc: "Chaîne de valeur cacao biologique premium pour les marchés européens." },
];

const sectors = ["Tous", "Agriculture", "Énergie", "Services financiers", "Tourisme", "Construction"];

export default function Investments() {
  const [activeSector, setActiveSector] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dbInvestments, isLoading } = trpc.investments.list.useQuery({ limit: 20, offset: 0 });

  const investments = dbInvestments && dbInvestments.length > 0 ? dbInvestments : null;

  const filteredSamples = useMemo(() => {
    let filtered = sampleInvestments;
    if (activeSector !== "Tous") filtered = filtered.filter((i) => i.sector === activeSector);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((i) => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    }
    return filtered;
  }, [activeSector, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Deal Flow</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Espace Investisseurs</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Découvrez les opportunités d'investissement les plus prometteuses de la zone CEEAC.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-primary">34.5M</div>
              <div className="text-sm text-muted-foreground font-sans">USD en deal flow</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground font-sans">Projets actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground font-sans">Secteurs couverts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-primary">11</div>
              <div className="text-sm text-muted-foreground font-sans">Pays CEEAC</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              {sectors.map((s) => (
                <button key={s} onClick={() => setActiveSector(s)} className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${activeSector === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{s}</button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Rechercher un projet..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : investments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investments.map((inv) => (
                <Card key={inv.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="habari-rubrique text-xs">{inv.sector}</span>
                      <span className="text-xs font-sans px-2 py-0.5 bg-green-50 text-green-700 rounded capitalize">{inv.status}</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-foreground mb-2">{inv.title}</h3>
                    {inv.description && <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">{inv.description}</p>}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-[oklch(0.72_0.15_75)]">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-bold font-sans">{inv.targetAmount} {inv.currency}</span>
                      </div>
                      <span className="text-xs font-sans px-2 py-1 bg-primary/10 text-primary rounded capitalize">{inv.investmentType}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSamples.map((inv) => (
                <Card key={inv.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="habari-rubrique text-xs">{inv.sector}</span>
                      <span className="text-xs font-sans px-2 py-0.5 bg-green-50 text-green-700 rounded capitalize">{inv.status}</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-foreground mb-2">{inv.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">{inv.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-sans">{inv.country}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[oklch(0.72_0.15_75)]">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-bold font-sans">{inv.amount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-sans px-2 py-1 bg-primary/10 text-primary rounded capitalize">{inv.type}</span>
                      <Button variant="ghost" size="sm" className="font-sans text-primary gap-1 p-0 h-auto">
                        En savoir plus <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSamples.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-sans">Aucune opportunité ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-primary mb-3">Vous avez un projet à financer ?</h2>
          <p className="text-muted-foreground font-sans mb-6 max-w-lg mx-auto">Soumettez votre projet à notre comité d'analyse pour être référencé dans notre deal flow.</p>
          <Link href="/abonnements">
            <Button className="font-sans bg-primary hover:bg-primary/90">Soumettre un projet</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
