import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, TreePine, Leaf, Shield, AlertTriangle, CheckCircle2, Gift } from "lucide-react";

const IMG = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/kJAxGRcqiWlstGKH.webp",
};

const forestData = [
  { country: "🇨🇩 RDC", area: "152,6 Mha", pctCover: "67%", annualLoss: "-0,25%", protectedAreas: 58, certifiedHa: "1,2 Mha" },
  { country: "🇦🇴 Angola", area: "66,6 Mha", pctCover: "53%", annualLoss: "-0,15%", protectedAreas: 14, certifiedHa: "0,3 Mha" },
  { country: "🇬🇦 Gabon", area: "23,5 Mha", pctCover: "88%", annualLoss: "-0,05%", protectedAreas: 13, certifiedHa: "2,1 Mha" },
  { country: "🇨🇬 Congo", area: "22,4 Mha", pctCover: "65%", annualLoss: "-0,10%", protectedAreas: 17, certifiedHa: "3,0 Mha" },
  { country: "🇨🇫 RCA", area: "22,3 Mha", pctCover: "36%", annualLoss: "-0,13%", protectedAreas: 16, certifiedHa: "0,5 Mha" },
  { country: "🇨🇲 Cameroun", area: "19,5 Mha", pctCover: "42%", annualLoss: "-0,20%", protectedAreas: 34, certifiedHa: "1,8 Mha" },
  { country: "🇹🇩 Tchad", area: "4,3 Mha", pctCover: "3%", annualLoss: "-0,80%", protectedAreas: 9, certifiedHa: "—" },
  { country: "🇬🇶 Guinée Éq.", area: "1,6 Mha", pctCover: "58%", annualLoss: "-0,12%", protectedAreas: 4, certifiedHa: "—" },
  { country: "🇷🇼 Rwanda", area: "0,5 Mha", pctCover: "20%", annualLoss: "+0,50%", protectedAreas: 5, certifiedHa: "—" },
  { country: "🇧🇮 Burundi", area: "0,2 Mha", pctCover: "7%", annualLoss: "-0,40%", protectedAreas: 6, certifiedHa: "—" },
];

const protectedAreas = [
  { name: "Parc national de la Salonga", country: "🇨🇩 RDC", area: "3,6 Mha", type: "Patrimoine mondial UNESCO", status: "Actif" },
  { name: "Parc national de la Lopé", country: "🇬🇦 Gabon", area: "0,5 Mha", type: "Patrimoine mondial UNESCO", status: "Actif" },
  { name: "Réserve de Dja", country: "🇨🇲 Cameroun", area: "0,5 Mha", type: "Réserve de biosphère", status: "Actif" },
  { name: "Parc national d'Odzala-Kokoua", country: "🇨🇬 Congo", area: "1,4 Mha", type: "Parc national", status: "Actif" },
  { name: "Parc national de Kahuzi-Biega", country: "🇨🇩 RDC", area: "0,6 Mha", type: "Patrimoine mondial UNESCO", status: "En danger" },
  { name: "Trinational de la Sangha", country: "🇨🇲🇨🇬🇬🇦", area: "0,75 Mha", type: "Patrimoine mondial UNESCO", status: "Actif" },
];

const comifacNews = [
  { date: "Janv. 2026", title: "COMIFAC : adoption du plan de convergence 2026-2030", desc: "Le nouveau plan stratégique met l'accent sur le financement durable des aires protégées et la gouvernance forestière." },
  { date: "Déc. 2025", title: "Gabon : 2,1 millions d'hectares certifiés FSC", desc: "Le Gabon confirme sa position de leader africain en matière de certification forestière durable." },
  { date: "Nov. 2025", title: "RDC : moratoire sur les nouvelles concessions forestières", desc: "Le gouvernement maintient le moratoire tout en développant un cadre de gestion communautaire." },
];

export default function GreenForets() {
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
          <span className="text-foreground font-medium">Forêts & biodiversité</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.04_155)] py-16">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.04_155)] to-[oklch(0.15_0.04_155)]/80" />
        </div>
        <div className="container relative">
          <div className="flex items-center gap-2 mb-4">
            <TreePine className="w-5 h-5 text-[oklch(0.75_0.18_145)]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.75_0.18_145)]">Habari Green</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Forêts & <span className="text-[oklch(0.75_0.18_145)]">biodiversité</span>
          </h1>
          <p className="text-white/60 font-sans max-w-2xl">
            Le bassin du Congo abrite la deuxième plus grande forêt tropicale au monde. Suivi du couvert forestier,
            aires protégées, certifications et actualités COMIFAC.
          </p>
        </div>
      </section>

      {/* Couvert forestier par pays */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Couvert forestier par pays</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-[oklch(0.30_0.08_155)] text-white">
                  <th className="text-left px-5 py-3.5 font-semibold">Pays</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Superficie</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden sm:table-cell">Couverture</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Perte annuelle</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden md:table-cell">Aires protégées</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden lg:table-cell">Certifié FSC/PEFC</th>
                </tr>
              </thead>
              <tbody>
                {forestData.map((row, i) => (
                  <tr key={row.country} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/40"}`}>
                    <td className="px-5 py-3.5 font-medium">{row.country}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground">{row.area}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.pctCover}</td>
                    <td className="text-right px-5 py-3.5">
                      <span className={`font-medium ${row.annualLoss.startsWith("+") ? "text-[oklch(0.45_0.15_145)]" : "text-red-600"}`}>
                        {row.annualLoss}
                      </span>
                    </td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden md:table-cell">{row.protectedAreas}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden lg:table-cell">{row.certifiedHa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-sans">Sources : FAO, Global Forest Watch — Données 2023.</p>
        </div>
      </section>

      {/* Aires protégées */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Aires protégées majeures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {protectedAreas.map((area) => (
              <Card key={area.name} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <Shield className="w-5 h-5 text-[oklch(0.45_0.15_145)] shrink-0 mt-0.5" />
                    <span className={`text-xs font-sans px-2 py-0.5 rounded-full font-medium ${
                      area.status === "Actif" ? "bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)]" : "bg-red-100 text-red-700"
                    }`}>
                      {area.status}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-foreground mb-1 text-sm">{area.name}</h3>
                  <p className="text-xs text-muted-foreground font-sans mb-2">{area.country} — {area.area}</p>
                  <span className="text-xs font-sans bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{area.type}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Actualités COMIFAC */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Actualités COMIFAC</h2>
          <div className="space-y-4">
            {comifacNews.map((news, i) => (
              <div key={i} className="bg-background border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="text-xs font-sans text-muted-foreground mb-1">{news.date}</div>
                <h3 className="font-serif font-bold text-foreground mb-1">{news.title}</h3>
                <p className="text-sm text-muted-foreground font-sans">{news.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[oklch(0.18_0.04_155)]">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Suivez l'actualité forestière</h2>
          <p className="text-white/60 font-sans mb-6 max-w-lg mx-auto">
            Alertes déforestation, rapports COMIFAC, suivi des certifications. Gratuit jusqu'au 1er juin 2026.
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
