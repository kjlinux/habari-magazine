import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Zap, Leaf, Sun, Droplets, Wind, Gift } from "lucide-react";

const IMG = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/QSExSDsQzqvwSUqS.webp",
  solaire: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/ZKFPmfVfXoybwtyy.jpg",
};

const energyMix = [
  { country: "🇨🇩 RDC", hydro: "96%", solar: "1%", thermal: "3%", accessRate: "19%", potential: "100 GW hydro", keyProject: "Grand Inga (44 GW)" },
  { country: "🇨🇲 Cameroun", hydro: "73%", solar: "2%", thermal: "25%", accessRate: "65%", potential: "12 GW hydro", keyProject: "Nachtigal (420 MW)" },
  { country: "🇬🇦 Gabon", hydro: "42%", solar: "1%", thermal: "57%", accessRate: "92%", potential: "6 GW hydro", keyProject: "FE2 Dibwangui (15 MW)" },
  { country: "🇨🇬 Congo", hydro: "62%", solar: "1%", thermal: "37%", accessRate: "50%", potential: "3 GW hydro", keyProject: "Sounda (1 GW)" },
  { country: "🇦🇴 Angola", hydro: "55%", solar: "3%", thermal: "42%", accessRate: "46%", potential: "18 GW hydro", keyProject: "Caculo Cabaça (2,2 GW)" },
  { country: "🇷🇼 Rwanda", hydro: "45%", solar: "8%", thermal: "40%", accessRate: "76%", potential: "0,3 GW", keyProject: "Ruzizi III (147 MW)" },
  { country: "🇹🇩 Tchad", hydro: "0%", solar: "5%", thermal: "95%", accessRate: "11%", potential: "Solaire ++", keyProject: "Djermaya Solar (32 MW)" },
  { country: "🇬🇶 Guinée Éq.", hydro: "35%", solar: "1%", thermal: "64%", accessRate: "67%", potential: "0,3 GW", keyProject: "Sendje (200 MW)" },
];

const majorProjects = [
  { name: "Grand Inga III", country: "🇨🇩 RDC", capacity: "11 050 MW", type: "Hydroélectrique", status: "Études", timeline: "2028-2035", investment: "$14 Mds" },
  { name: "Nachtigal", country: "🇨🇲 Cameroun", capacity: "420 MW", type: "Hydroélectrique", status: "En construction", timeline: "2024-2026", investment: "$1,2 Md" },
  { name: "Caculo Cabaça", country: "🇦🇴 Angola", capacity: "2 172 MW", type: "Hydroélectrique", status: "En construction", timeline: "2023-2027", investment: "$4,5 Mds" },
  { name: "Ruzizi III", country: "🇨🇩🇷🇼🇧🇮", capacity: "147 MW", type: "Hydroélectrique", status: "En construction", timeline: "2024-2028", investment: "$625M" },
  { name: "Djermaya Solar", country: "🇹🇩 Tchad", capacity: "32 MW", type: "Solaire PV", status: "Opérationnel", timeline: "2024", investment: "$40M" },
  { name: "Scaling Solar Gabon", country: "🇬🇦 Gabon", capacity: "50 MW", type: "Solaire PV", status: "Planifié", timeline: "2026-2027", investment: "$60M" },
];

export default function GreenEnergie() {
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
          <span className="text-foreground font-medium">Transition énergétique</span>
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
            <Zap className="w-5 h-5 text-[oklch(0.75_0.18_145)]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.75_0.18_145)]">Habari Green</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Transition <span className="text-[oklch(0.75_0.18_145)]">énergétique</span>
          </h1>
          <p className="text-white/60 font-sans max-w-2xl">
            107 GW de potentiel hydroélectrique, un ensoleillement exceptionnel. La zone CEEAC dispose d'atouts
            considérables pour la transition énergétique. État des lieux et projets majeurs.
          </p>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="py-10 bg-[oklch(0.97_0.01_155)] border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Droplets, label: "Potentiel hydro", value: "107 GW", color: "text-blue-600" },
              { icon: Sun, label: "Ensoleillement moyen", value: "5,5 kWh/m²/j", color: "text-amber-500" },
              { icon: Zap, label: "Taux d'accès moyen", value: "48%", color: "text-[oklch(0.45_0.15_145)]" },
              { icon: Wind, label: "Investissements ENR 2025", value: "$2,1 Mds", color: "text-purple-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-background rounded-xl border border-border p-5 shadow-sm text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-serif font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground font-sans mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mix énergétique */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Mix énergétique par pays</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-[oklch(0.30_0.08_155)] text-white">
                  <th className="text-left px-5 py-3.5 font-semibold">Pays</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Hydro</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Solaire</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden sm:table-cell">Thermique</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden md:table-cell">Accès élec.</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden lg:table-cell">Projet phare</th>
                </tr>
              </thead>
              <tbody>
                {energyMix.map((row, i) => (
                  <tr key={row.country} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/40"}`}>
                    <td className="px-5 py-3.5 font-medium">{row.country}</td>
                    <td className="text-right px-5 py-3.5 text-blue-600 font-medium">{row.hydro}</td>
                    <td className="text-right px-5 py-3.5 text-amber-500 font-medium">{row.solar}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.thermal}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden md:table-cell">{row.accessRate}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">{row.keyProject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-sans">Sources : IRENA, Banque mondiale, IEA — Données 2023-2024.</p>
        </div>
      </section>

      {/* Projets majeurs */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Projets ENR majeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {majorProjects.map((proj) => (
              <Card key={proj.name} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {proj.type === "Solaire PV" ? <Sun className="w-4 h-4 text-amber-500" /> : <Droplets className="w-4 h-4 text-blue-600" />}
                    <span className="text-xs font-sans text-muted-foreground">{proj.type}</span>
                  </div>
                  <h3 className="font-serif font-bold text-foreground mb-1">{proj.name}</h3>
                  <p className="text-xs text-muted-foreground font-sans mb-2">{proj.country}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                    <div>
                      <span className="text-muted-foreground">Capacité</span>
                      <div className="font-semibold text-foreground">{proj.capacity}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Investissement</span>
                      <div className="font-semibold text-[oklch(0.45_0.15_145)]">{proj.investment}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground font-sans">{proj.timeline}</span>
                    <span className={`text-xs font-sans px-2 py-0.5 rounded-full font-medium ${
                      proj.status === "Opérationnel" ? "bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)]" :
                      proj.status === "En construction" ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[oklch(0.18_0.04_155)]">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Suivez la transition énergétique</h2>
          <p className="text-white/60 font-sans mb-6 max-w-lg mx-auto">
            Projets ENR, appels d'offres énergie, données de production. Gratuit jusqu'au 1er juin 2026.
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
