import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Leaf, ArrowLeft, BarChart3, TrendingUp, TrendingDown,
  Globe2, FileText, AlertCircle, CheckCircle2, Gift,
} from "lucide-react";

const IMG = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/IaSyzHrryzjyeroU.png",
};

/* Données vitrine — Dashboard carbone */
const pricingData = [
  { standard: "VCS (Verra)", price: "$6,20", change: "+12%", up: true, volume: "18,5M tCO₂e" },
  { standard: "Gold Standard", price: "$8,40", change: "+8%", up: true, volume: "4,2M tCO₂e" },
  { standard: "Plan Vivo", price: "$12,50", change: "+5%", up: true, volume: "0,8M tCO₂e" },
  { standard: "CDM (MDP)", price: "$2,10", change: "-3%", up: false, volume: "1,1M tCO₂e" },
];

const reddProjects = [
  { name: "Mai-Ndombe REDD+", country: "🇨🇩 RDC", area: "300 000 ha", credits: "5,2M tCO₂e", status: "Opérationnel", developer: "Wildlife Works" },
  { name: "Sangha Trinational", country: "🇨🇲🇨🇬🇬🇦", area: "750 000 ha", credits: "2,8M tCO₂e", status: "Opérationnel", developer: "WWF / Gouvernements" },
  { name: "Ntokou-Pikounda", country: "🇨🇬 Congo", area: "427 000 ha", credits: "1,5M tCO₂e", status: "Développement", developer: "WCS" },
  { name: "Luki Biosphere", country: "🇨🇩 RDC", area: "33 000 ha", credits: "0,4M tCO₂e", status: "Développement", developer: "WWF-DRC" },
  { name: "Ivindo National Park", country: "🇬🇦 Gabon", area: "300 000 ha", credits: "1,2M tCO₂e", status: "Opérationnel", developer: "Gabon / ANPN" },
];

const recentDeals = [
  { date: "Janv. 2026", deal: "Gabon — Vente de 2,5M crédits REDD+ à la Norvège", amount: "$15M", type: "Bilatéral" },
  { date: "Déc. 2025", deal: "RDC — Accord-cadre avec LEAF Coalition", amount: "$50M", type: "Coalition" },
  { date: "Nov. 2025", deal: "Congo — Émission obligations vertes souveraines", amount: "$200M", type: "Obligation verte" },
];

const regulations = [
  { country: "🇬🇦 Gabon", status: "Avancé", desc: "Cadre national carbone, registre opérationnel, accord Norvège" },
  { country: "🇨🇩 RDC", status: "En cours", desc: "Moratoire levé, cadre REDD+ national, registre en développement" },
  { country: "🇨🇲 Cameroun", status: "En cours", desc: "Stratégie REDD+ adoptée, cadre juridique en préparation" },
  { country: "🇨🇬 Congo", status: "Émergent", desc: "NDC actualisée, projets pilotes REDD+" },
  { country: "🇬🇶 Guinée Éq.", status: "Émergent", desc: "NDC soumise, cadre réglementaire à développer" },
];

export default function GreenCarbone() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-[oklch(0.97_0.01_155)] border-b border-border py-3">
        <div className="container flex items-center gap-2 text-sm font-sans">
          <Link href="/green" className="text-[oklch(0.45_0.15_145)] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Habari Green
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Marchés carbone</span>
        </div>
      </div>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.04_155)] py-16">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.04_155)] to-[oklch(0.15_0.04_155)]/80" />
        </div>
        <div className="container relative">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[oklch(0.75_0.18_145)]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.75_0.18_145)]">Habari Green — Dashboard</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Marchés carbone <span className="text-[oklch(0.75_0.18_145)]">CEEAC</span>
          </h1>
          <p className="text-white/60 font-sans max-w-2xl">
            Prix des crédits, volumes échangés, projets REDD+ en cours, deals récents et réglementation par pays.
          </p>
        </div>
      </section>

      {/* ═══════ PRIX DES CRÉDITS ═══════ */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Prix des crédits carbone</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-[oklch(0.30_0.08_155)] text-white">
                  <th className="text-left px-5 py-3.5 font-semibold">Standard</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Prix moyen</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Variation</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden sm:table-cell">Volume émis (2025)</th>
                </tr>
              </thead>
              <tbody>
                {pricingData.map((row, i) => (
                  <tr key={row.standard} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/40"}`}>
                    <td className="px-5 py-3.5 font-medium">{row.standard}</td>
                    <td className="text-right px-5 py-3.5 font-semibold text-foreground">{row.price}</td>
                    <td className="text-right px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 font-medium ${row.up ? "text-[oklch(0.45_0.15_145)]" : "text-red-600"}`}>
                        {row.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {row.change}
                      </span>
                    </td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-sans">
            Sources : Ecosystem Marketplace, Verra Registry — Données indicatives, mises à jour mensuellement.
          </p>
        </div>
      </section>

      {/* ═══════ PROJETS REDD+ ═══════ */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Projets REDD+ majeurs</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-[oklch(0.30_0.08_155)] text-white">
                  <th className="text-left px-5 py-3.5 font-semibold">Projet</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Pays</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden sm:table-cell">Superficie</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Crédits</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden md:table-cell">Statut</th>
                </tr>
              </thead>
              <tbody>
                {reddProjects.map((row, i) => (
                  <tr key={row.name} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/40"}`}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.developer}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.country}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.area}</td>
                    <td className="text-right px-5 py-3.5 font-medium text-[oklch(0.45_0.15_145)]">{row.credits}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                        row.status === "Opérationnel"
                          ? "bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)]"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {row.status === "Opérationnel" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════ DEALS RÉCENTS ═══════ */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Deals récents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDeals.map((deal, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="text-xs font-sans text-muted-foreground mb-2">{deal.date}</div>
                  <h3 className="font-serif font-bold text-foreground mb-2 text-sm leading-snug">{deal.deal}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-serif font-bold text-[oklch(0.45_0.15_145)]">{deal.amount}</span>
                    <span className="text-xs font-sans bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{deal.type}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ RÉGLEMENTATION ═══════ */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Réglementation carbone par pays</h2>
          <div className="space-y-3">
            {regulations.map((reg) => (
              <div key={reg.country} className="bg-background border border-border rounded-lg p-4 flex items-start gap-4">
                <span className="text-lg shrink-0">{reg.country}</span>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-sans">{reg.desc}</p>
                </div>
                <span className={`text-xs font-sans px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  reg.status === "Avancé" ? "bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)]" :
                  reg.status === "En cours" ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-16 bg-[oklch(0.18_0.04_155)]">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-white mb-3">
            Accédez au dashboard carbone complet
          </h2>
          <p className="text-white/60 font-sans mb-6 max-w-lg mx-auto">
            Données en temps réel, alertes personnalisées, rapports détaillés par projet.
            Gratuit jusqu'au 1er juin 2026.
          </p>
          <Link href="/inscription">
            <Button size="lg" className="font-sans bg-[oklch(0.75_0.18_145)] text-[oklch(0.15_0.04_155)] hover:bg-[oklch(0.80_0.18_145)] font-semibold">
              <Gift className="w-4 h-4 mr-2" /> S'inscrire gratuitement
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
