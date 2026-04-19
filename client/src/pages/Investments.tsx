import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, TrendingUp, DollarSign, MapPin, ArrowRight, BarChart3, ArrowUpRight, ArrowDownRight, Minus, Globe2 } from "lucide-react";
import { Link } from "wouter";
import { Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { paywallCta, paywallMessage, type SubscriptionTier } from "@/lib/access";

const sectors = ["Tous", "Agriculture", "Énergie", "Services financiers", "Tourisme", "Construction"];

/* ═══ INDICATEURS ÉCONOMIQUES CEEAC PAR PAYS (hardcodé) ═══ */
const ceeacCountryIndicators = [
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
  const { data: dbInvestments, isLoading } = trpc.investments.list.useQuery({ limit: 40, offset: 0 });
  const { data: statsData } = trpc.investments.stats.useQuery();
  const { data: indicatorsData } = trpc.investments.indicators.useQuery();

  const investments = useMemo(() => {
    let list = dbInvestments ?? [];
    if (activeSector !== "Tous") list = list.filter((i: any) => i.sector === activeSector);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i: any) =>
        i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [dbInvestments, activeSector, searchQuery]);

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
            <span className="text-xs font-sans text-muted-foreground bg-muted px-2 py-0.5 rounded">{indicatorsData?.[0]?.periodLabel ?? "—"}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {indicatorsData && indicatorsData.length > 0 ? (
              indicatorsData.map((item, i) => (
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-6 text-center py-4">Aucun indicateur disponible.</p>
            )}
          </div>
        </div>
      </section>

      {/* ═══ DEAL FLOW STATS ═══ */}
      <section className="border-b border-border bg-background">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-primary">{statsData?.totalAmount ?? "—"}</div>
              <div className="text-sm text-muted-foreground font-sans">USD en deal flow</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-primary">{statsData?.activeCount ?? "—"}</div>
              <div className="text-sm text-muted-foreground font-sans">Projets actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-primary">{statsData?.sectorCount ?? "—"}</div>
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
              <span className="text-xs font-sans text-muted-foreground bg-muted px-2 py-0.5 rounded">{indicatorsData?.[0]?.periodLabel ?? "—"}</span>
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
                  {ceeacCountryIndicators.map((row, i) => (
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
            ) : investments.length === 0 ? (
              <div className="text-center py-20">
                <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-sans">
                  {(dbInvestments?.length ?? 0) === 0
                    ? "Les opportunités d'investissement seront bientôt disponibles."
                    : "Aucune opportunité ne correspond à votre recherche."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {investments.map((inv: any) => {
                  const access = inv.access;
                  const locked = access && !access.allowed;
                  const cta = locked ? paywallCta(access.reason, access.requiredTier as SubscriptionTier | undefined) : null;
                  const msg = locked ? paywallMessage(access.reason, access.trialDaysRemaining ?? 0, access.requiredTier as SubscriptionTier | undefined) : "";
                  return (
                    <Card key={inv.id} className={`border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${locked ? "relative" : ""}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="habari-rubrique text-xs">{inv.sector}</span>
                          <span className="text-xs font-sans px-2 py-0.5 bg-green-50 text-green-700 rounded capitalize">{inv.status}</span>
                          {locked && (
                            <span className="text-xs font-sans font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Premium
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-lg text-foreground mb-2">{inv.title}</h3>
                        {inv.description && <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">{inv.description}</p>}
                        {locked ? (
                          <div className="pt-3 border-t border-border space-y-3">
                            <p className="text-xs text-muted-foreground font-sans">{msg}</p>
                            <Link href={cta!.href}>
                              <Button size="sm" className="font-sans w-full">{cta!.label}</Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-1 text-[oklch(0.72_0.15_75)]">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-bold font-sans">{inv.targetAmount} {inv.currency}</span>
                            </div>
                            <span className="text-xs font-sans px-2 py-1 bg-primary/10 text-primary rounded capitalize">{inv.investmentType}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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
