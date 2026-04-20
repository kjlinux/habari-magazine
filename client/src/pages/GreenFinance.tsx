import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Landmark, Leaf, TrendingUp, Globe2, Gift } from "lucide-react";

const IMG = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/rjQKChcjogvooorf.jpg",
};

const climateFunds = [
  { name: "Fonds Vert pour le Climat (FVC)", allocation: "$1,2 Md", region: "Afrique Centrale", projects: 8, focus: "Adaptation, forêts, énergie", status: "Actif" },
  { name: "CAFI (Initiative Forêts d'Afrique Centrale)", allocation: "$800M", region: "Bassin du Congo", projects: 12, focus: "REDD+, gouvernance forestière", status: "Actif" },
  { name: "Fonds d'Adaptation", allocation: "$150M", region: "Pays CEEAC", projects: 6, focus: "Résilience climatique", status: "Actif" },
  { name: "FEM (GEF)", allocation: "$350M", region: "Afrique Centrale", projects: 15, focus: "Biodiversité, dégradation des terres", status: "Actif" },
  { name: "Fonds Bleu pour le Bassin du Congo", allocation: "$50M", region: "Bassin du Congo", projects: 3, focus: "Ressources en eau, zones humides", status: "Lancement" },
];

const greenBonds = [
  { issuer: "🇨🇬 République du Congo", amount: "$200M", year: "2025", type: "Obligation souveraine verte", use: "Forêts, énergie propre" },
  { issuer: "Banque de Développement des États de l'AC", amount: "$100M", year: "2025", type: "Obligation verte BDEAC", use: "Projets ENR, agriculture durable" },
  { issuer: "🇬🇦 République du Gabon", amount: "$500M", year: "2024", type: "Obligation bleue souveraine", use: "Économie bleue, aires marines" },
];

const esgInvestors = [
  { name: "Meridiam", type: "Fonds infra", focus: "Énergie, transport durable", presence: "🇨🇲 Cameroun, 🇬🇦 Gabon" },
  { name: "Proparco (AFD)", type: "DFI", focus: "ENR, agriculture, PME vertes", presence: "Toute la zone CEEAC" },
  { name: "IFC (Banque mondiale)", type: "DFI", focus: "Finance climat, forêts", presence: "🇨🇩 RDC, 🇨🇲 Cameroun, 🇬🇦 Gabon" },
  { name: "FMO", type: "DFI", focus: "Énergie, inclusion financière verte", presence: "🇨🇩 RDC, 🇷🇼 Rwanda" },
  { name: "Mirova", type: "Asset manager ESG", focus: "Forêts, capital naturel", presence: "Bassin du Congo" },
  { name: "Norfund", type: "DFI", focus: "Énergie propre, agriculture", presence: "🇷🇼 Rwanda, 🇨🇩 RDC" },
];

export default function GreenFinance() {
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
          <span className="text-foreground font-medium">Finance verte</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.04_155)] py-16">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.04_155)] to-[oklch(0.15_0.04_155)]/80" />
        </div>
        <div className="container relative">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-[oklch(0.75_0.18_145)]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.75_0.18_145)]">Habari Green</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Finance <span className="text-[oklch(0.75_0.18_145)]">verte</span>
          </h1>
          <p className="text-white/60 font-sans max-w-2xl">
            Fonds climat, obligations vertes, investisseurs ESG et mécanismes de financement de la transition
            écologique en Afrique Centrale.
          </p>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="py-10 bg-[oklch(0.97_0.01_155)] border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Finance climat captée", value: "$0,8 Md/an", trend: "+15%" },
              { label: "Fonds actifs", value: "5+", trend: "Majeurs" },
              { label: "Obligations vertes émises", value: "$800M", trend: "2024-2025" },
              { label: "Investisseurs ESG", value: "12+", trend: "Actifs" },
            ].map((stat) => (
              <div key={stat.label} className="bg-background rounded-xl border border-border p-5 shadow-sm">
                <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-serif font-bold text-foreground">{stat.value}</span>
                  <span className="text-xs font-sans font-semibold text-[oklch(0.45_0.15_145)] bg-[oklch(0.45_0.15_145)]/10 px-1.5 py-0.5 rounded mb-1">
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonds climat */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Fonds climat actifs en Afrique Centrale</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-[oklch(0.30_0.08_155)] text-white">
                  <th className="text-left px-5 py-3.5 font-semibold">Fonds</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Allocation</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden sm:table-cell">Projets</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden md:table-cell">Focus</th>
                </tr>
              </thead>
              <tbody>
                {climateFunds.map((fund, i) => (
                  <tr key={fund.name} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/40"}`}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{fund.name}</div>
                      <div className="text-xs text-muted-foreground">{fund.region}</div>
                    </td>
                    <td className="text-right px-5 py-3.5 font-semibold text-[oklch(0.45_0.15_145)]">{fund.allocation}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{fund.projects}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{fund.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Obligations vertes */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Obligations vertes & bleues</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {greenBonds.map((bond, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="text-xs font-sans text-muted-foreground mb-2">{bond.year} — {bond.type}</div>
                  <h3 className="font-serif font-bold text-foreground mb-1">{bond.issuer}</h3>
                  <div className="text-2xl font-serif font-bold text-[oklch(0.45_0.15_145)] mb-2">{bond.amount}</div>
                  <p className="text-xs text-muted-foreground font-sans">Utilisation : {bond.use}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investisseurs ESG */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Investisseurs ESG actifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {esgInvestors.map((inv) => (
              <div key={inv.name} className="bg-background border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Globe2 className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
                  <span className="text-xs font-sans bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{inv.type}</span>
                </div>
                <h3 className="font-serif font-bold text-foreground mb-1">{inv.name}</h3>
                <p className="text-xs text-muted-foreground font-sans mb-1">Focus : {inv.focus}</p>
                <p className="text-xs text-muted-foreground font-sans">Présence : {inv.presence}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[oklch(0.18_0.04_155)]">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Accédez aux données finance verte</h2>
          <p className="text-white/60 font-sans mb-6 max-w-lg mx-auto">
            Suivi des fonds, alertes obligations vertes, annuaire investisseurs ESG. Gratuit jusqu'au 1er juin 2026.
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
