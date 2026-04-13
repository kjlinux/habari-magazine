import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2, ArrowRight, TrendingUp, BarChart3, Globe2, Briefcase,
  Calendar, BookOpen, Users, Lock, Mail, CheckCircle2, Star, Shield, Gift, Clock, Sparkles,
  Leaf, TreePine, Zap, Landmark
} from "lucide-react";
import { Link } from "wouter";
import SocialShare from "@/components/SocialShare";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* CDN image URLs */
const IMG = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/xHsIsQQBVYADZfbj.jpg",
  cemac: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/cKOkqXwvCEGzMsUQ.jpg",
  gabon: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/ufPCeWOQxrZNjANy.jpg",
  ceeacVert: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/bouvLYpOwMPwrZVh.jpg",
  business: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/HdYjDeXbHfdvYVDK.jpg",
  cultureConcert: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/OddcsXlrdntxupnS.jpg",
  culturePortrait: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/MsiRkJOHcDfupLNH.jpg",
};

/* Baromètre CEEAC — données statiques vitrine (11 pays membres) */
const barometre = [
  { country: "RDC", flag: "🇨🇩", pib: "~65 Mds $", croissance: "+6,2%", inflation: "9,5%", pop: "105M" },
  { country: "Angola", flag: "🇦🇴", pib: "~78 Mds $", croissance: "+3,0%", inflation: "13,8%", pop: "36M" },
  { country: "Cameroun", flag: "🇨🇲", pib: "~45 Mds $", croissance: "+4,2%", inflation: "5,8%", pop: "28M" },
  { country: "Gabon", flag: "🇬🇦", pib: "~20 Mds $", croissance: "+3,0%", inflation: "3,2%", pop: "2,4M" },
  { country: "Tchad", flag: "🇹🇩", pib: "~12 Mds $", croissance: "+3,5%", inflation: "6,3%", pop: "18M" },
  { country: "Congo", flag: "🇨🇬", pib: "~14 Mds $", croissance: "+2,5%", inflation: "4,1%", pop: "6M" },
  { country: "Guinée Éq.", flag: "🇬🇶", pib: "~11 Mds $", croissance: "+1,8%", inflation: "2,9%", pop: "1,7M" },
  { country: "Rwanda", flag: "🇷🇼", pib: "~13 Mds $", croissance: "+7,2%", inflation: "6,1%", pop: "14M" },
  { country: "Burundi", flag: "🇧🇮", pib: "~3 Mds $", croissance: "+3,6%", inflation: "18,2%", pop: "13M" },
  { country: "RCA", flag: "🇨🇫", pib: "~2,5 Mds $", croissance: "+1,2%", inflation: "4,5%", pop: "5,5M" },
  { country: "São Tomé", flag: "🇸🇹", pib: "~0,6 Mds $", croissance: "+2,8%", inflation: "7,9%", pop: "0,2M" },
];

/* Contenu vitrine — articles en accès libre avec images */
const freeContent = [
  {
    rubrique: "Dossier Central",
    badge: "Accès libre",
    title: "Panne sèche à la CEMAC — Crise financière et ajustements budgétaires",
    excerpt: "La zone CEMAC traverse une période charnière. Entre crise financière, dette souveraine et suspension des activités de la Commission, Habari décrypte les ressorts de cette crise historique.",
    image: IMG.cemac,
    slug: "cemac-panne-seche",
  },
  {
    rubrique: "Enquête",
    badge: "Accès libre",
    title: "Gabon — Oligui Nguema face au mur de l'argent : la renaissance à crédit",
    excerpt: "Le Gabon affiche une ambition économique tous azimuts. Mais derrière la volonté politique se cache une équation plus dure : transformer l'économie avant que la contrainte budgétaire ne l'impose.",
    image: IMG.gabon,
    slug: "gabon-oligui-mur-argent",
  },
  {
    rubrique: "Dossier Stratégique",
    badge: "Accès libre",
    title: "La CEEAC face au paradoxe vert — Capital naturel d'envergure mondiale, captation financière marginale",
    excerpt: "30 % des forêts tropicales mondiales, 107 GW de potentiel hydroélectrique, mais seulement 0,8 Md$ de finance verte captée par an. Les clés du retournement.",
    image: IMG.ceeacVert,
    slug: "ceeac-paradoxe-vert",
  },
  {
    rubrique: "La Grande Interview",
    badge: "Accès libre",
    title: "Loïc Mackosso : \u00ab Rester debout, c'est décider de se renforcer \u00bb",
    excerpt: "Banquier d'affaires et fondateur d'Aries Investissements, Loïc Mackosso livre un témoignage puissant sur la résilience, l'entrepreneuriat en Afrique et la reconstruction après la guerre civile au Congo.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/ARoCDHZWpDwKcVeV.jpg",
    slug: "interview-mackosso-rester-debout",
  },
];

/* Contenu premium — aperçu verrouillé */
const premiumContent = [
  {
    rubrique: "Analyse Pays",
    title: "Tchad – Cameroun – Gabon : trajectoires comparées",
    excerpt: "Trois économies, trois profils distincts. Analyse approfondie des opportunités et des risques.",
    image: IMG.business,
  },
  {
    rubrique: "Dossier Complet",
    title: "Politique monétaire BEAC : les marges de manœuvre",
    excerpt: "Décryptage des instruments de la BEAC face aux contraintes de la zone franc.",
  },
  {
    rubrique: "Tribune",
    title: "Pour une stratégie industrielle régionale",
    excerpt: "Contribution exclusive d'un ancien ministre de l'Économie sur la diversification productive.",
  },
  {
    rubrique: "Culture & Société",
    title: "Akendengué : le retour d'un homme devenu repère",
    excerpt: "Pierre Claver Akendengué, 82 ans, est remonté sur scène à l'Institut français de Libreville. Deux soirs où une mémoire s'est remise à chanter.",
    image: IMG.culturePortrait,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: dbArticles, isLoading: articlesLoading } = trpc.articles.list.useQuery({ limit: 3, offset: 0 });
  const { data: events } = trpc.events.upcoming.useQuery({ limit: 3 });

  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlDone, setNlDone] = useState(false);
  const subscribeMutation = trpc.newsletter.subscribe.useMutation();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail) return;
    setNlLoading(true);
    try {
      await subscribeMutation.mutateAsync({ email: nlEmail, tier: "free" });
      setNlDone(true);
      toast.success("Inscription confirmée ! Bienvenue dans la communauté Habari.");
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setNlLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════ HERO — VITRINE PREMIUM ═══════ */}
      <section className="relative overflow-hidden bg-[oklch(0.20_0.02_250)]">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.15_0.02_250)] via-[oklch(0.18_0.02_250)]/95 to-[oklch(0.18_0.02_250)]/70" />
        </div>
        <div className="container relative py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
                <Star className="w-3.5 h-3.5 text-[oklch(0.72_0.15_75)]" />
                <span className="text-xs font-sans text-white/80 tracking-wide">Connexion économique pour l'intégration de l'Afrique Centrale. Comprendre, décider, investir, agir.</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.12] mb-6">
                Connecter les acteurs économiques de l'Afrique Centrale
              </h1>
              <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-6"></div>
              <p className="text-lg text-white/65 leading-relaxed mb-8 max-w-xl font-sans">
                Analyses de fond, données exclusives, réseau de décideurs. Habari est le magazine de référence
                pour les professionnels et investisseurs engagés dans la zone CEEAC.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/abonnements">
                  <Button size="lg" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] w-full sm:w-auto font-semibold">
                    Découvrir nos offres <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/magazine">
                  <Button size="lg" variant="outline" className="font-sans border-white/25 text-white hover:bg-white/10 w-full sm:w-auto">
                    Lire le magazine
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero right — Numéro courant */}
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              {/* Image d'en-tête du numéro */}
              <div className="relative h-40 overflow-hidden">
                <img src={IMG.cemac} alt="Dossier CEMAC" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.02_250)] to-transparent" />
                <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between">
                  <div className="habari-rubrique text-[oklch(0.72_0.15_75)]">Numéro 1 — Février 2026</div>
                  <span className="text-xs font-sans text-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">Trimestriel</span>
                </div>
              </div>
              <div className="p-6 pt-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                  Panne sèche à la CEMAC
                </h2>
                <p className="text-sm text-white/55 font-sans leading-relaxed mb-5">
                  Crise financière, dette souveraine, suspension des activités de la Commission. Dossier complet sur les six économies de la zone CEMAC.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-xl font-serif font-bold text-[oklch(0.72_0.15_75)]">265M</div>
                    <div className="text-[0.65rem] text-white/50 font-sans mt-0.5">Habitants CEEAC</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-xl font-serif font-bold text-[oklch(0.72_0.15_75)]">~265</div>
                    <div className="text-[0.65rem] text-white/50 font-sans mt-0.5">Mds $ PIB</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-xl font-serif font-bold text-[oklch(0.72_0.15_75)]">11</div>
                    <div className="text-[0.65rem] text-white/50 font-sans mt-0.5">Pays membres</div>
                  </div>
                </div>
                <Link href="/article/cemac-panne-seche">
                  <Button className="w-full font-sans bg-primary/80 hover:bg-primary text-white">
                    Lire le dossier <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BAROMÈTRE MENSUEL — ACCÈS LIBRE ═══════ */}
      <section className="py-16 bg-muted/30 border-b border-border">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[oklch(0.72_0.15_75)]" />
                <span className="habari-rubrique">Baromètre mensuel</span>
                <span className="text-[0.6rem] font-sans bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">Accès libre</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-primary">Indicateurs économiques CEEAC</h2>
              <div className="habari-separator mt-3"></div>
            </div>
            <Link href="/magazine" className="hidden md:block">
              <Button variant="ghost" className="font-sans gap-2 text-primary">
                Analyse complète <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="text-left px-5 py-3.5 font-semibold">Pays</th>
                  <th className="text-right px-5 py-3.5 font-semibold">PIB</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Croissance</th>
                  <th className="text-right px-5 py-3.5 font-semibold hidden sm:table-cell">Inflation</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Population</th>
                </tr>
              </thead>
              <tbody>
                {barometre.map((row, i) => (
                  <tr key={row.country} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/40"}`}>
                    <td className="px-5 py-3.5 font-medium">
                      <span className="mr-2">{row.flag}</span>
                      {row.country}
                    </td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground">{row.pib}</td>
                    <td className="text-right px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {row.croissance}
                      </span>
                    </td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.inflation}</td>
                    <td className="text-right px-5 py-3.5 text-muted-foreground">{row.pop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-sans">Sources : BEAC, FMI, Banque mondiale — Estimations 2024-2025. Mis à jour mensuellement.</p>
        </div>
      </section>

      {/* ═══════ ARTICLES EN ACCÈS LIBRE ═══════ */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="habari-rubrique">En accès libre</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-primary">Articles du numéro</h2>
              <p className="text-sm text-muted-foreground font-sans mt-2">Les dossiers et enquêtes du numéro inaugural.</p>
              <div className="habari-separator mt-3"></div>
            </div>
            <Link href="/magazine">
              <Button variant="ghost" className="font-sans gap-2 text-primary">
                Tout le magazine <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {articlesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(dbArticles && dbArticles.length > 0 ? dbArticles : freeContent).map((item: any, i: number) => (
                <Link key={i} href={item.slug ? `/article/${item.slug}` : "/magazine"}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    <div className="w-full h-52 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                      {item.image || item.featuredImage ? (
                        <img
                          src={item.image || item.featuredImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-primary/25" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 text-[0.6rem] font-sans bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                        Accès libre
                      </span>
                    </div>
                    <CardContent className="p-5">
                      <div className="habari-rubrique text-xs mb-2">{item.rubrique || "Article"}</div>
                      <h3 className="font-serif font-bold text-lg text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">{item.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-sans">Février 2026</span>
                        <SocialShare
                          title={item.title}
                          excerpt={item.excerpt}
                          url={item.slug ? `${window.location.origin}/article/${item.slug}` : window.location.origin}
                          variant="compact"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════ CONTENU PREMIUM — APERÇU VERROUILLÉ ═══════ */}
      <section className="py-16 bg-[oklch(0.97_0.005_250)]">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[oklch(0.72_0.15_75)]" />
                <span className="habari-rubrique">Contenu premium</span>
                <span className="text-[0.6rem] font-sans bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.55_0.12_75)] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1"><Gift className="w-3 h-3" /> Offre lancement</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-primary">Accès gratuit pour les inscrits</h2>
              <p className="text-sm text-muted-foreground font-sans mt-2">Jusqu'au 1er juin 2026, tout le contenu premium est accessible gratuitement. Inscrivez-vous !</p>
              <div className="habari-separator mt-3"></div>
            </div>
            <Link href="/inscription">
              <Button className="font-sans gap-2 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)]">
                <Gift className="w-4 h-4" /> S'inscrire gratuitement
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumContent.map((item, i) => (
              <div key={i} className="relative group">
                <Card className="border-0 shadow-sm overflow-hidden h-full opacity-90">
                  <div className="w-full h-52 bg-gradient-to-br from-[oklch(0.72_0.15_75)]/15 to-primary/10 relative overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-70" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Lock className="w-10 h-10 text-[oklch(0.72_0.15_75)]/40" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[0.6rem] font-sans bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.55_0.12_75)] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Gratuit jusqu'au 1er juin
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <div className="habari-rubrique text-xs mb-2">{item.rubrique}</div>
                    <h3 className="font-serif font-bold text-lg text-foreground leading-snug mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2">{item.excerpt}</p>
                  </CardContent>
                </Card>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <Link href="/inscription">
                    <Button size="sm" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)]">
                      <Gift className="w-3.5 h-3.5 mr-1.5" /> S'inscrire pour lire
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HABARI GREEN — WIDGET ═══════ */}
      <section className="py-16 bg-[oklch(0.18_0.04_155)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.45_0.15_145)]/20 to-transparent" />
        </div>
        <div className="container relative">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-[oklch(0.75_0.18_145)]" />
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.75_0.18_145)]">Économie verte</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-white">HABARI <span className="text-[oklch(0.75_0.18_145)]">GREEN</span></h2>
              <p className="text-sm text-white/50 font-sans mt-2">Économie verte & développement durable en Afrique Centrale</p>
              <div className="w-16 h-1 bg-[oklch(0.75_0.18_145)] mt-3"></div>
            </div>
            <Link href="/green">
              <Button className="font-sans gap-2 bg-[oklch(0.75_0.18_145)] text-[oklch(0.15_0.04_155)] hover:bg-[oklch(0.80_0.18_145)]">
                Explorer <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Indicateurs express */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Prix crédit VCM", value: "$6,20", trend: "+12%" },
              { label: "Projets REDD+", value: "47", trend: "+8" },
              { label: "Finance verte/an", value: "$0,8 Md", trend: "+15%" },
              { label: "Potentiel hydro", value: "107 GW", trend: "CEEAC" },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <p className="text-[0.65rem] font-sans text-white/50 uppercase tracking-wider mb-0.5">{item.label}</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-xl font-serif font-bold text-white">{item.value}</span>
                  <span className="text-[0.6rem] font-sans font-semibold text-[oklch(0.75_0.18_145)] bg-[oklch(0.75_0.18_145)]/15 px-1.5 py-0.5 rounded mb-0.5">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sous-rubriques */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: BarChart3, label: "Marchés carbone", href: "/green/carbone" },
              { icon: TreePine, label: "Forêts", href: "/green/forets" },
              { icon: Zap, label: "Énergie", href: "/green/energie" },
              { icon: Landmark, label: "Finance verte", href: "/green/finance" },
              { icon: Users, label: "Acteurs verts", href: "/green/acteurs" },
              { icon: BookOpen, label: "Ressources", href: "/green/ressources" },
            ].map((sub) => (
              <Link key={sub.href} href={sub.href}>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors cursor-pointer group">
                  <sub.icon className="w-5 h-5 text-[oklch(0.75_0.18_145)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-sans text-white/70 group-hover:text-white transition-colors">{sub.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ NEWSLETTER ═══════ */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/5 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary mb-3">
              La newsletter Habari
            </h2>
            <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mx-auto mb-5"></div>
            <p className="text-muted-foreground font-sans mb-8 max-w-lg mx-auto">
              Chaque semaine, recevez un résumé de l'actualité économique de la zone CEEAC, une analyse courte et l'agenda des événements.
            </p>

            {/* Two tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="border border-border rounded-xl p-6 bg-background">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground">Newsletter Gratuite</h3>
                    <span className="text-xs font-sans text-green-700 font-semibold">0 € / mois</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm font-sans text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Résumé hebdomadaire de l'actualité CEEAC</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> 1 analyse courte par semaine</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Agenda des événements à venir</li>
                </ul>
              </div>
              <div className="border-2 border-[oklch(0.72_0.15_75)] rounded-xl p-6 bg-[oklch(0.72_0.15_75)]/5 relative">
                <div className="absolute -top-3 right-4 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] text-[0.6rem] font-sans font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Recommandé
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.72_0.15_75)]/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[oklch(0.55_0.12_75)]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground">Newsletter Premium</h3>
                    <span className="text-xs font-sans text-[oklch(0.55_0.12_75)] font-semibold">15-25 € / mois</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm font-sans text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Analyse approfondie hebdomadaire</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Données exclusives et tableaux de bord</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Accès aux archives complètes</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Invitations événements Habari</li>
                </ul>
              </div>
            </div>

            {/* Newsletter form */}
            {nlDone ? (
              <div className="flex items-center justify-center gap-3 py-4 px-6 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-sans text-green-700 font-medium">Merci ! Vous recevrez notre prochaine newsletter.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <Button type="submit" disabled={nlLoading} className="font-sans bg-primary hover:bg-primary/90 px-6">
                  {nlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire gratuitement"}
                </Button>
              </form>
            )}
            <p className="text-xs text-muted-foreground font-sans mt-3">Newsletter gratuite. Désabonnement en un clic.</p>
          </div>
        </div>
      </section>

      {/* ═══════ AGENDA ÉVÉNEMENTS — ACCÈS LIBRE ═══════ */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="habari-rubrique">Agenda</span>
                <span className="text-[0.6rem] font-sans bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">Accès libre</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-primary">Événements à venir</h2>
              <div className="habari-separator mt-3"></div>
            </div>
            <Link href="/evenements">
              <Button variant="ghost" className="font-sans gap-2 text-primary">
                Tout l'agenda <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(events && events.length > 0 ? events : [
              { day: "26", month: "févr.", title: "Cultur'Com — Ouagadougou 2026", location: "Ouagadougou, Burkina Faso", type: "conference" },
              { day: "15", month: "nov.", title: "PME-Bright Forum — N'Djamena 2026", location: "N'Djamena, Tchad", type: "conference" },
              { day: "—", month: "2026", title: "Petit-déjeuner décideurs CEEAC — Kinshasa", location: "Kinshasa, RDC", type: "networking" },
            ]).map((ev: any, i: number) => (
              <div key={i} className="bg-background border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-center bg-primary/5 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-serif font-bold text-primary">
                      {ev.startDate ? new Date(ev.startDate).getDate() : ev.day}
                    </div>
                    <div className="text-xs text-muted-foreground font-sans uppercase">
                      {ev.startDate ? new Date(ev.startDate).toLocaleDateString('fr-FR', { month: 'short' }) : ev.month}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-foreground mb-1 line-clamp-2">{ev.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{ev.location}</p>
                    <span className="inline-block mt-2 text-xs font-sans px-2 py-1 bg-[oklch(0.72_0.15_75)]/10 text-[oklch(0.55_0.12_75)] rounded capitalize">{ev.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TÉLÉCHARGEMENT MAGAZINE ═══════ */}
      <section className="py-16 bg-[oklch(0.20_0.02_250)] text-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/TDJnjIvMMFwogdcg.webp"
                  alt="Couverture Habari Magazine N°000"
                  className="w-56 md:w-64 rounded-lg shadow-2xl border border-white/10"
                />
                <div className="absolute -top-3 -right-3 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] font-sans font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
                  N°000
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[oklch(0.72_0.15_75)]" />
                <span className="habari-rubrique text-[oklch(0.72_0.15_75)]">Kiosque numérique</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                Téléchargez le dernier numéro
              </h2>
              <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mb-5"></div>
              <p className="text-white/60 font-sans leading-relaxed mb-4">
                <strong className="text-white">Habari N°000 — Juin 2024</strong> : Mahamat Idriss Deby, le pari de l'union et de la réconciliation nationale. 67 pages d'analyses, d'interviews et de décryptages sur l'actualité africaine.
              </p>
              <div className="flex items-center gap-6 mb-6 text-sm font-sans text-white/50">
                <span>67 pages</span>
                <span>•</span>
                <span>Format PDF</span>
                <span>•</span>
                <span>Gratuit</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/pqeNdyKiCydqFTQF.pdf" download="Habari-Magazine-N000.pdf" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] w-full sm:w-auto font-semibold shadow-lg">
                    <ArrowRight className="w-4 h-4 mr-2 rotate-90" /> Télécharger le PDF
                  </Button>
                </a>
                <Link href="/telecharger">
                  <Button size="lg" variant="outline" className="font-sans border-white/25 text-white hover:bg-white/10 w-full sm:w-auto">
                    Tous les numéros
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SERVICES HABARI ═══════ */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-primary">L'écosystème Habari</h2>
            <div className="habari-separator mx-auto mt-3"></div>
            <p className="text-muted-foreground font-sans mt-4 max-w-lg mx-auto">
              Au-delà du magazine, Habari propose un ensemble de services pour les professionnels et investisseurs de la zone CEEAC.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe2, title: "Annuaire économique", desc: "Répertoire des acteurs clés de la zone CEEAC", href: "/annuaire", badge: null },
              { icon: Briefcase, title: "Espace investisseurs", desc: "Opportunités d'investissement qualifiées", href: "/investisseurs", badge: "Premium" },
              { icon: Users, title: "Appels d'offres", desc: "Marchés publics et opportunités commerciales", href: "/appels-offres", badge: null },
              { icon: Calendar, title: "Événements", desc: "Conférences, formations et networking", href: "/evenements", badge: null },
            ].map((svc) => (
              <Link key={svc.title} href={svc.href}>
                <div className="group bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer h-full relative">
                  {svc.badge && (
                    <span className="absolute top-3 right-3 text-[0.55rem] font-sans bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.55_0.12_75)] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> {svc.badge}
                    </span>
                  )}
                  <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <svc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-foreground mb-2">{svc.title}</h3>
                  <p className="text-sm text-muted-foreground font-sans">{svc.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA FINAL ═══════ */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.business} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        <div className="container relative text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Rejoignez la communauté Habari
          </h2>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mx-auto mb-6"></div>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 font-sans">
            Accédez à des analyses exclusives, des données économiques fiables et un réseau de décideurs
            engagés dans le développement de la zone CEEAC.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/abonnements">
              <Button size="lg" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] font-semibold">
                Découvrir nos offres
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/inscription">
                <Button size="lg" variant="outline" className="font-sans border-white/30 text-white hover:bg-white/10">
                  Créer un compte gratuit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
