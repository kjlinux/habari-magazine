import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Leaf, TreePine, Zap, Landmark, Users, FileText,
  ArrowRight, TrendingUp, Globe2, BarChart3, Shield,
  Lock, Gift, CheckCircle2, BookOpen, Clock,
} from "lucide-react";

/* CDN images */
const IMG = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/kJAxGRcqiWlstGKH.webp",
  carbone: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/IaSyzHrryzjyeroU.png",
  forets: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/kJAxGRcqiWlstGKH.webp",
  energie: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/QSExSDsQzqvwSUqS.webp",
  finance: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/rjQKChcjogvooorf.jpg",
  solaire: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/ZKFPmfVfXoybwtyy.jpg",
};

/* Données vitrine carbone */
const carbonData = [
  { label: "Prix crédit VCM", value: "$6,20", trend: "+12%", desc: "Marché volontaire" },
  { label: "Projets REDD+ actifs", value: "47", trend: "+8", desc: "Zone CEEAC" },
  { label: "Crédits émis 2025", value: "18,5M", trend: "+23%", desc: "Tonnes CO₂e" },
  { label: "Finance verte captée", value: "$0,8 Md", trend: "+15%", desc: "Par an (CEEAC)" },
];

/* Sous-rubriques */
const sections = [
  {
    icon: BarChart3,
    title: "Marchés carbone",
    desc: "Dashboard carbone : prix des crédits, volumes échangés, projets REDD+ en cours, deals récents et réglementation par pays.",
    href: "/green/carbone",
    image: IMG.carbone,
    badge: "Aperçu libre",
    features: ["Prix crédits temps réel", "Projets REDD+ cartographiés", "Deals récents", "Réglementation par pays"],
  },
  {
    icon: TreePine,
    title: "Forêts & biodiversité",
    desc: "Actualités COMIFAC, aires protégées, certifications forestières, suivi de la déforestation dans le bassin du Congo.",
    href: "/green/forets",
    image: IMG.forets,
    badge: "Accès libre",
    features: ["Couvert forestier par pays", "Aires protégées CEEAC", "Certifications FSC/PEFC", "Alertes déforestation"],
  },
  {
    icon: Zap,
    title: "Transition énergétique",
    desc: "Hydroélectricité, solaire, biomasse : projets ENR, mix énergétique et potentiel de la zone CEEAC.",
    href: "/green/energie",
    image: IMG.energie,
    badge: "Accès libre",
    features: ["107 GW potentiel hydro", "Projets solaires actifs", "Mix énergétique par pays", "Investissements ENR"],
  },
  {
    icon: Landmark,
    title: "Finance verte",
    desc: "Fonds climat (FVC, CAFI), obligations vertes, investisseurs ESG et mécanismes de financement de la transition.",
    href: "/green/finance",
    image: IMG.finance,
    badge: "Aperçu libre",
    features: ["Fonds Vert pour le Climat", "Obligations vertes", "Investisseurs ESG", "CAFI & fonds bilatéraux"],
  },
  {
    icon: Users,
    title: "Acteurs verts",
    desc: "Annuaire des développeurs carbone, ONG environnementales, certificateurs, consultants climat et fonds ESG.",
    href: "/green/acteurs",
    image: IMG.solaire,
    badge: "Liste libre",
    features: ["Développeurs projets", "ONG environnement", "Certificateurs", "Consultants climat"],
  },
  {
    icon: FileText,
    title: "Ressources",
    desc: "Guides pratiques, rapports de référence, outils méthodologiques et veille réglementaire climat.",
    href: "/green/ressources",
    image: null,
    badge: "Accès libre",
    features: ["Guides NDC par pays", "Rapports COMIFAC", "Outils MRV", "Veille réglementaire"],
  },
];

/* Indicateurs verts CEEAC */
const greenIndicators = [
  { country: "RDC", flag: "🇨🇩", forest: "152 Mha", emissions: "0,04 t/hab", reddProjects: 12, potential: "100 GW hydro" },
  { country: "Cameroun", flag: "🇨🇲", forest: "19,5 Mha", emissions: "0,39 t/hab", reddProjects: 8, potential: "12 GW hydro" },
  { country: "Gabon", flag: "🇬🇦", forest: "23,5 Mha", emissions: "2,77 t/hab", reddProjects: 6, potential: "6 GW hydro" },
  { country: "Congo", flag: "🇨🇬", forest: "22,4 Mha", emissions: "0,64 t/hab", reddProjects: 5, potential: "3 GW hydro" },
  { country: "Guinée Éq.", flag: "🇬🇶", forest: "1,6 Mha", emissions: "4,73 t/hab", reddProjects: 1, potential: "0,3 GW" },
  { country: "RCA", flag: "🇨🇫", forest: "22,3 Mha", emissions: "0,05 t/hab", reddProjects: 3, potential: "2 GW hydro" },
  { country: "Tchad", flag: "🇹🇩", forest: "4,3 Mha", emissions: "0,06 t/hab", reddProjects: 2, potential: "0,5 GW" },
  { country: "Angola", flag: "🇦🇴", forest: "66,6 Mha", emissions: "0,77 t/hab", reddProjects: 4, potential: "18 GW hydro" },
  { country: "Rwanda", flag: "🇷🇼", forest: "0,5 Mha", emissions: "0,08 t/hab", reddProjects: 3, potential: "0,3 GW" },
  { country: "Burundi", flag: "🇧🇮", forest: "0,2 Mha", emissions: "0,04 t/hab", reddProjects: 2, potential: "0,2 GW" },
  { country: "São Tomé", flag: "🇸🇹", forest: "0,03 Mha", emissions: "0,59 t/hab", reddProjects: 1, potential: "—" },
];

export default function Green() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.04_155)]">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.04_155)] via-[oklch(0.15_0.04_155)]/95 to-[oklch(0.15_0.04_155)]/70" />
        </div>
        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl">

            <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.12] mb-4">
              HABARI <span className="text-[oklch(0.75_0.18_145)]">GREEN</span>
            </h1>
            <p className="text-xl text-[oklch(0.75_0.18_145)]/80 font-serif mb-4">
              Économie verte & développement durable en Afrique Centrale
            </p>
            <div className="w-20 h-1 bg-[oklch(0.75_0.18_145)] mb-6"></div>
            <p className="text-lg text-white/65 leading-relaxed mb-8 max-w-xl font-sans">
              30 % des forêts tropicales mondiales, 107 GW de potentiel hydroélectrique, un capital naturel
              d'envergure mondiale. Habari Green décrypte la transition verte de la zone CEEAC.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/green/carbone">
                <Button size="lg" className="font-sans bg-[oklch(0.75_0.18_145)] text-[oklch(0.15_0.04_155)] hover:bg-[oklch(0.80_0.18_145)] w-full sm:w-auto font-semibold">
                  Dashboard carbone <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/inscription">
                <Button size="lg" variant="outline" className="font-sans border-white/25 text-white hover:bg-white/10 w-full sm:w-auto">
                  <Gift className="w-4 h-4 mr-2" /> Accès gratuit jusqu'au 1er juin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ WIDGET CARBONE EXPRESS ═══════ */}
      <section className="py-12 bg-[oklch(0.97_0.01_155)] border-b border-border">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.45_0.15_145)]">Indicateurs carbone — Temps réel</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {carbonData.map((item) => (
              <div key={item.label} className="bg-background rounded-xl border border-border p-5 shadow-sm">
                <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-serif font-bold text-foreground">{item.value}</span>
                  <span className="text-xs font-sans font-semibold text-[oklch(0.45_0.15_145)] bg-[oklch(0.45_0.15_145)]/10 px-1.5 py-0.5 rounded mb-1">
                    {item.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-sans">
            Sources : Verra, Gold Standard, Ecosystem Marketplace — Données indicatives, mises à jour mensuellement.
          </p>
        </div>
      </section>

      {/* ═══════ DOSSIER EN VEDETTE ═══════ */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.45_0.15_145)]">Dossier en vedette</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary">L'économie verte, nouvelle doctrine de compétitivité</h2>
            <div className="w-16 h-1 bg-[oklch(0.75_0.18_145)] mt-3"></div>
          </div>

          <Link href="/article/economie-verte-doctrine-competitivite">
            <div className="group cursor-pointer rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/nlkVQeeaJhCivjDJ.jpg"
                    alt="Économie verte Afrique Centrale"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center bg-gradient-to-br from-[oklch(0.97_0.01_155)] to-background">
                  <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-sans font-semibold uppercase tracking-wider text-[oklch(0.45_0.15_145)] bg-[oklch(0.45_0.15_145)]/10 px-3 py-1 rounded-full w-fit mb-4">
                    Dossier Central — Économie & Stratégie
                  </span>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-foreground leading-snug mb-4 group-hover:text-[oklch(0.35_0.12_145)] transition-colors">
                    L'économie verte, nouvelle doctrine de compétitivité pour l'Afrique Centrale
                  </h3>
                  <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                    La transition climatique mondiale redistribue les cartes de la compétitivité économique.
                    Pour la zone CEEAC, cette recomposition est une opportunité historique de repositionnement.
                    Marchés carbone, minerais critiques, finance verte : analyse des trois filières de valeur que la région ne maîtrise pas encore.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-sans mb-6">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 18 min de lecture</span>
                    <span>Février 2026</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-[0.6rem] font-sans bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)] px-2.5 py-1 rounded-full font-medium">Marchés carbone</span>
                    <span className="text-[0.6rem] font-sans bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)] px-2.5 py-1 rounded-full font-medium">Minerais critiques</span>
                    <span className="text-[0.6rem] font-sans bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)] px-2.5 py-1 rounded-full font-medium">Finance verte</span>
                    <span className="text-[0.6rem] font-sans bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)] px-2.5 py-1 rounded-full font-medium">Gouvernance CEEAC</span>
                  </div>
                  <div className="flex items-center gap-2 text-[oklch(0.45_0.15_145)] font-sans font-semibold text-sm group-hover:gap-3 transition-all">
                    Lire le dossier complet <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
          {/* Article emplois verts */}
          <Link href="/article/emplois-verts-ceeac">
            <div className="group cursor-pointer rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-56 lg:h-auto overflow-hidden">
                  <img
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/oTOnqHICldnZxqIH.jpg"
                    alt="Emplois verts CEEAC"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center bg-gradient-to-br from-[oklch(0.97_0.01_155)] to-background">
                  <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-sans font-semibold uppercase tracking-wider text-[oklch(0.45_0.15_145)] bg-[oklch(0.45_0.15_145)]/10 px-3 py-1 rounded-full w-fit mb-4">
                    Business & Innovation — Marché de l'emploi
                  </span>
                  <h3 className="font-serif text-xl lg:text-2xl font-bold text-foreground leading-snug mb-4 group-hover:text-[oklch(0.35_0.12_145)] transition-colors">
                    Emplois verts en CEEAC : le potentiel existe, la structuration manque
                  </h3>
                  <p className="text-muted-foreground font-sans leading-relaxed mb-6 text-sm">
                    Aquaculture, horticulture, hydroélectricité, énergie solaire : des initiatives portent leurs fruits.
                    Mais transformer des projets isolés en moteur d'emploi régional exige bien davantage qu'un catalogue de bonnes pratiques.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-sans mb-4">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 12 min de lecture</span>
                    <span>Février 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-[oklch(0.45_0.15_145)] font-sans font-semibold text-sm group-hover:gap-3 transition-all">
                    Lire l'article <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════ SOUS-RUBRIQUES ═══════ */}
      <section className="py-16">
        <div className="container">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.45_0.15_145)]">Rubriques</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary">Explorer l'économie verte CEEAC</h2>
            <div className="w-16 h-1 bg-[oklch(0.75_0.18_145)] mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((sec) => (
              <Link key={sec.href} href={sec.href}>
                <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                  <div className="w-full h-44 bg-gradient-to-br from-[oklch(0.45_0.15_145)]/10 to-[oklch(0.45_0.15_145)]/5 relative overflow-hidden">
                    {sec.image ? (
                      <img src={sec.image} alt={sec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[oklch(0.45_0.15_145)]/15 to-[oklch(0.35_0.10_145)]/10">
                        <sec.icon className="w-12 h-12 text-[oklch(0.45_0.15_145)]/30" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[0.6rem] font-sans bg-[oklch(0.45_0.15_145)]/15 text-[oklch(0.35_0.12_145)] backdrop-blur-sm px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                      {sec.badge}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <sec.icon className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
                      <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.45_0.15_145)]">Habari Green</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-foreground leading-snug mb-2 group-hover:text-[oklch(0.35_0.12_145)] transition-colors">
                      {sec.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">{sec.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sec.features.slice(0, 3).map((f) => (
                        <span key={f} className="text-[0.6rem] font-sans bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ INDICATEURS VERTS CEEAC ═══════ */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe2 className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.45_0.15_145)]">Baromètre vert</span>
                <span className="text-[0.6rem] font-sans bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                  Aperçu
                </span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-primary">Indicateurs verts CEEAC</h2>
              <div className="w-16 h-1 bg-[oklch(0.75_0.18_145)] mt-3"></div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-[oklch(0.30_0.08_155)] text-white">
                  <th className="text-left px-5 py-3.5 font-semibold">Pays</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Couvert forestier</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden sm:table-cell">Émissions CO₂/hab</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Projets REDD+</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden md:table-cell">Potentiel ENR</th>
                </tr>
              </thead>
              <tbody>
                {greenIndicators.map((row, i) => (
                  <tr key={row.country} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/40"}`}>
                    <td className="px-5 py-3.5 font-medium">
                      <span className="mr-2">{row.flag}</span>
                      {row.country}
                    </td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground">{row.forest}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.emissions}</td>
                    <td className="text-right px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[oklch(0.45_0.15_145)] font-medium">
                        <TreePine className="w-3 h-3" />
                        {row.reddProjects}
                      </span>
                    </td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden md:table-cell">{row.potential}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-sans">
            Sources : FAO, Global Forest Watch, Banque mondiale, IRENA — Estimations 2023-2024.
          </p>
        </div>
      </section>

      {/* ═══════ ÉVÉNEMENTS GREEN ═══════ */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.45_0.15_145)]">Agenda Green</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary">Événements économie verte</h2>
            <div className="w-16 h-1 bg-[oklch(0.75_0.18_145)] mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { day: "—", month: "2026", title: "HABARI GREEN SUMMIT", location: "Douala, Cameroun", type: "Conférence annuelle", desc: "Le rendez-vous annuel des acteurs de la transition verte en Afrique Centrale." },
              { day: "—", month: "Mensuel", title: "Petit-déjeuner climat", location: "Libreville / Douala / Kinshasa", type: "Networking", desc: "Rencontres mensuelles entre décideurs et acteurs de l'économie verte." },
              { day: "Nov.", month: "2026", title: "COP31 — Belem", location: "Belem, Brésil", type: "Agenda partenaire", desc: "Suivi de la participation des pays CEEAC à la COP31 sur le climat." },
            ].map((ev, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-center bg-[oklch(0.45_0.15_145)]/5 rounded-lg p-3 min-w-[60px]">
                    <div className="text-xl font-serif font-bold text-[oklch(0.35_0.12_145)]">{ev.day}</div>
                    <div className="text-xs text-muted-foreground font-sans uppercase">{ev.month}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-foreground mb-1">{ev.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans mb-1">{ev.location}</p>
                    <p className="text-xs text-muted-foreground font-sans mb-2">{ev.desc}</p>
                    <span className="inline-block text-xs font-sans px-2 py-1 bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)] rounded">{ev.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA INSCRIPTION ═══════ */}
      <section className="py-20 bg-[oklch(0.18_0.04_155)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.solaire} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-[oklch(0.18_0.04_155)]/80" />
        </div>
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <Gift className="w-3.5 h-3.5 text-[oklch(0.75_0.18_145)]" />
            <span className="text-xs font-sans text-white/80 tracking-wide">Offre de lancement</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Accédez à Habari Green <span className="text-[oklch(0.75_0.18_145)]">gratuitement</span>
          </h2>
          <div className="w-20 h-1 bg-[oklch(0.75_0.18_145)] mx-auto mb-6"></div>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-4 font-sans">
            Jusqu'au 1er juin 2026, l'intégralité du contenu Habari Green est accessible gratuitement
            pour tous les inscrits. Dashboard carbone, données forestières, finance verte.
          </p>
          <div className="flex items-center justify-center gap-6 mb-8 text-sm font-sans text-white/50">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[oklch(0.75_0.18_145)]" /> Dashboard carbone</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[oklch(0.75_0.18_145)]" /> Données forestières</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[oklch(0.75_0.18_145)]" /> Finance verte</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription">
              <Button size="lg" className="font-sans bg-[oklch(0.75_0.18_145)] text-[oklch(0.15_0.04_155)] hover:bg-[oklch(0.80_0.18_145)] font-semibold">
                <Gift className="w-4 h-4 mr-2" /> S'inscrire gratuitement
              </Button>
            </Link>
            <Link href="/abonnements">
              <Button size="lg" variant="outline" className="font-sans border-white/30 text-white hover:bg-white/10">
                Voir les abonnements
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
