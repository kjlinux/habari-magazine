import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, TrendingUp, DollarSign, MapPin, ArrowRight, BarChart3, ArrowUpRight, ArrowDownRight, Minus, Globe2 } from "lucide-react";
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

/* ═══ INDICATEURS ÉCONOMIQUES CEEAC PAR PAYS ═══ */
const ceeacIndicators = [
  { flag: "🇨🇩", country: "RDC", pib: "~65 Mds $", croissance: "+6,2%", croissanceTrend: "up", inflation: "5,5%", population: "105M" },
  { flag: "🇦🇴", country: "Angola", pib: "~70 Mds $", croissance: "+3,0%", croissanceTrend: "up", inflation: "13,8%", population: "30M" },
  { flag: "🇨🇲", country: "Cameroun", pib: "~45 Mds $", croissance: "+4,2%", croissanceTrend: "up", inflation: "5,8%", population: "28M" },
  { flag: "🇬🇦", country: "Gabon", pib: "~20 Mds $", croissance: "+3,0%", croissanceTrend: "up", inflation: "3,2%", population: "2,4M" },
  { flag: "🇹🇩", country: "Tchad", pib: "~12 Mds $", croissance: "+3,5%", croissanceTrend: "up", inflation: "6,3%", population: "18M" },
  { flag: "🇨🇬", country: "Congo", pib: "~14 Mds $", croissance: "+2,5%", croissanceTrend: "up", inflation: "4,1%", population: "6M" },
  { flag: "🇬🇶", country: "Guinée Éq.", pib: "~11 Mds $", croissance: "+1,8%", croissanceTrend: "up", inflation: "2,0%", population: "1,7M" },
  { flag: "🇷🇼", country: "Rwanda", pib: "~13 Mds $", croissance: "+7,2%", croissanceTrend: "up", inflation: "6,1%", population: "14M" },
  { flag: "🇧🇮", country: "Burundi", pib: "~3 Mds $", croissance: "+3,0%", croissanceTrend: "up", inflation: "18,2%", population: "13M" },
  { flag: "🇨🇫", country: "RCA", pib: "~2,5 Mds $", croissance: "+1,2%", croissanceTrend: "up", inflation: "4,0%", population: "5,5M" },
  { flag: "🇸🇹", country: "São Tomé", pib: "~0,6 Mds $", croissance: "+1,9%", croissanceTrend: "up", inflation: "7,5%", population: "0,2M" },
];

type ViewMode = "deals" | "indicators";

export default function Investments() {
  const [activeSector, setActiveSector] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("deals");
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

      {/* ═══ BAROMÈTRE ÉCONOMIQUE CEEAC ═══ */}
      <section className="py-10 bg-muted/30 border-b border-border">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-[oklch(0.72_0.15_75)]" />
            <h2 className="font-serif text-xl font-bold text-foreground">Baromètre économique CEEAC</h2>
            <span className="text-xs font-sans text-muted-foreground bg-muted px-2 py-0.5 rounded">Mars 2026</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "PIB CEEAC", value: "~265 Mds $", trend: "up", delta: "+2.8%" },
              { label: "Inflation moy.", value: "6.2%", trend: "down", delta: "-0.4 pts" },
              { label: "IDE entrants", value: "12.3 Mds $", trend: "up", delta: "+8.5%" },
              { label: "Pétrole (Brent)", value: "78.40 $", trend: "stable", delta: "+0.2%" },
              { label: "Cacao (t)", value: "8 240 $", trend: "up", delta: "+12%" },
              { label: "Cobalt (t)", value: "35 200 $", trend: "down", delta: "-3.1%" },
            ].map((item, i) => (
              <div key={i} className="bg-background rounded-lg border border-border p-4">
                <div className="text-xs text-muted-foreground font-sans mb-1">{item.label}</div>
                <div className="text-lg font-serif font-bold text-foreground">{item.value}</div>
                <div className={`flex items-center gap-1 text-xs font-sans mt-1 ${
                  item.trend === "up" ? "text-green-600" : item.trend === "down" ? "text-red-500" : "text-muted-foreground"
                }`}>
                  {item.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : item.trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {item.delta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEAL FLOW STATS ═══ */}
      <section className="border-b border-border bg-background">
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

      {/* ═══ ONGLETS : DEALS / INDICATEURS ÉCONOMIQUES ═══ */}
      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          {/* Sélecteur principal : Deals vs Indicateurs */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setViewMode("deals")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-sans font-semibold rounded-lg transition-colors ${
                viewMode === "deals"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Deal Flow
            </button>
            <button
              onClick={() => setViewMode("indicators")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-sans font-semibold rounded-lg transition-colors ${
                viewMode === "indicators"
                  ? "bg-[oklch(0.72_0.15_75)] text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Globe2 className="w-4 h-4" />
              Indicateurs économiques CEEAC
            </button>
          </div>

          {/* Filtres de catégories (uniquement en mode deals) */}
          {viewMode === "deals" && (
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
          )}
        </div>
      </section>

      {/* ═══ CONTENU : DEALS OU INDICATEURS ═══ */}
      {viewMode === "indicators" ? (
        <section className="py-12">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="w-5 h-5 text-[oklch(0.72_0.15_75)]" />
              <h2 className="font-serif text-2xl font-bold text-foreground">Indicateurs économiques CEEAC</h2>
              <span className="text-xs font-sans text-muted-foreground bg-muted px-2 py-0.5 rounded">Mars 2026</span>
              <Link href="/investisseurs" className="ml-auto text-sm font-sans text-primary hover:underline flex items-center gap-1">
                Analyse complète <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Tableau par pays */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[oklch(0.25_0.03_250)] text-white">
                    <th className="px-4 py-3.5 text-left font-sans font-semibold">Pays</th>
                    <th className="px-4 py-3.5 text-left font-sans font-semibold">PIB</th>
                    <th className="px-4 py-3.5 text-left font-sans font-semibold">Croissance</th>
                    <th className="px-4 py-3.5 text-left font-sans font-semibold">Inflation</th>
                    <th className="px-4 py-3.5 text-left font-sans font-semibold">Population</th>
                  </tr>
                </thead>
                <tbody>
                  {ceeacIndicators.map((row, i) => (
                    <tr key={row.country} className={`border-b border-border transition-colors hover:bg-muted/50 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                      <td className="px-4 py-3.5 font-sans font-medium text-foreground">
                        <span className="mr-2">{row.flag}</span>
                        {row.country}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-foreground font-semibold">{row.pib}</td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 font-sans text-green-600">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          {row.croissance}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-sans text-foreground">{row.inflation}</td>
                      <td className="px-4 py-3.5 font-sans text-muted-foreground">{row.population}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Source */}
            <p className="text-xs text-muted-foreground font-sans mt-4 text-right">
              Sources : FMI, Banque mondiale, BAD — Données estimées 2025-2026
            </p>
          </div>
        </section>
      ) : (
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
      )}

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
