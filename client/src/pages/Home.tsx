import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import type { HeroSlide, GreenMetric, GreenCategory, EcosystemCard, HomepageMagazine } from "@/lib/homepageTypes";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Loader2, ArrowRight, TrendingUp, BarChart3, Globe2, Briefcase,
  Calendar, BookOpen, Users, Lock, Mail, CheckCircle2, Star, Shield, Gift, Clock, Sparkles,
  Leaf, TreePine, Zap, Landmark, ChevronLeft, ChevronRight, Download
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

/* Fallback data — used when backend settings not yet configured */
const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    rubrique: "Dossier Central",
    title: "Panne sèche à la CEMAC — Crise financière et ajustements budgétaires",
    excerpt: "La zone CEMAC traverse une période charnière. Entre crise financière, dette souveraine et suspension des activités de la Commission.",
    image: IMG.cemac,
    slug: "cemac-panne-seche",
    stats: { label1: "265M hab.", label2: "~265 Mds $ PIB", label3: "11 pays" },
  },
  {
    rubrique: "Enquête",
    title: "Gabon — Oligui Nguema face au mur de l'argent",
    excerpt: "Le Gabon affiche une ambition économique tous azimuts. Mais derrière la volonté politique se cache une équation plus dure.",
    image: IMG.gabon,
    slug: "gabon-oligui-mur-argent",
    stats: { label1: "20 Mds $ PIB", label2: "+3,0% croiss.", label3: "2,4M hab." },
  },
  {
    rubrique: "Dossier Stratégique",
    title: "La CEEAC face au paradoxe vert — Capital naturel d'envergure mondiale",
    excerpt: "30 % des forêts tropicales mondiales, 107 GW de potentiel hydroélectrique, mais seulement 0,8 Md$ de finance verte captée.",
    image: IMG.ceeacVert,
    slug: "ceeac-paradoxe-vert",
    stats: { label1: "30% forêts", label2: "107 GW hydro", label3: "0,8 Md$ vert" },
  },
  {
    rubrique: "La Grande Interview",
    title: "Loïc Mackosso : \u00ab Rester debout, c'est décider de se renforcer \u00bb",
    excerpt: "Banquier d'affaires et fondateur d'Aries Investissements, Loïc Mackosso livre un témoignage puissant sur la résilience.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/mackosso1_cropped_3c196986.jpg",
    slug: "interview-mackosso-rester-debout",
    stats: { label1: "Congo-Brazza", label2: "Aries Invest.", label3: "Finance" },
  },
  {
    rubrique: "Culture & Société",
    title: "La révolution du mobile money change-t-elle les comportements sociaux ?",
    excerpt: "856 millions de comptes et 1 000 milliards de dollars de transactions annuelles. Le mobile money redéfinit les solidarités.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/qIZrLdK4gbPn_90cf748f.jpg",
    slug: "revolution-mobile-money-afrique",
    stats: { label1: "856M comptes", label2: "1 000 Mds $", label3: "Afrique" },
  },
];

const FALLBACK_FREE_CONTENT = [
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
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/mackosso1_cropped_3c196986.jpg",
    slug: "interview-mackosso-rester-debout",
  },
  {
    rubrique: "Habari Green",
    badge: "Accès libre",
    title: "Cobalt et minerais stratégiques : bénédiction ou piège économique pour l'Afrique ?",
    excerpt: "Avec 70 % de la production mondiale de cobalt, l'Afrique est au c\u0153ur de la révolution énergétique. Mais la Chine contrôle 73 % du raffinage. Bénédiction ou nouveau piège extractif ?",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/nhhpqOsQjMrA_e4729627.jpg",
    slug: "cobalt-minerais-verts-afrique",
  },
  {
    rubrique: "Habari Green",
    badge: "Accès libre",
    title: "Les villes africaines face au défi climatique : entre contraintes et opportunités",
    excerpt: "Avec 700 millions de nouveaux citadins attendus d'ici 2050, l'Afrique doit construire des villes durables sans répéter les erreurs des pays industrialisés.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/GQwuI2Igxrdy_a1957686.jpg",
    slug: "villes-africaines-defi-climatique",
  },
  {
    rubrique: "Culture & Société",
    title: "La montée des femmes entrepreneuses change-t-elle l'économie africaine ?",
    excerpt: "L'Afrique détient le taux d'entrepreneuriat féminin le plus élevé au monde. Pourtant, moins de 5 % du financement startup va à des CEO femmes.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/q66ZJPQU1SQY_02c30c67.jpg",
    slug: "femmes-entrepreneuses-afrique",
  },
  {
    rubrique: "Culture & Société",
    title: "La révolution du mobile money change-t-elle les comportements sociaux en Afrique ?",
    excerpt: "Avec 856 millions de comptes et 1 000 milliards de dollars de transactions annuelles, le mobile money redéfinit les solidarités familiales.",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/qIZrLdK4gbPn_90cf748f.jpg",
    slug: "revolution-mobile-money-afrique",
  },
];

const FALLBACK_PREMIUM_CONTENT = [
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
    excerpt: "Pierre Claver Akendengué, 82 ans, est remonté sur scène à l'Institut français de Libreville.",
    image: IMG.culturePortrait,
  },
];

const FALLBACK_GREEN_METRICS: GreenMetric[] = [
  { label: "Prix crédit VCM", value: "$6,20", trend: "+12%" },
  { label: "Projets REDD+", value: "47", trend: "+8" },
  { label: "Finance verte/an", value: "$0,8 Md", trend: "+15%" },
  { label: "Potentiel hydro", value: "107 GW", trend: "CEEAC" },
];

const FALLBACK_GREEN_CATEGORIES: GreenCategory[] = [
  { label: "Marchés carbone", href: "/green/carbone", iconKey: "BarChart3" },
  { label: "Forêts", href: "/green/forets", iconKey: "TreePine" },
  { label: "Énergie", href: "/green/energie", iconKey: "Zap" },
  { label: "Finance verte", href: "/green/finance", iconKey: "Landmark" },
  { label: "Acteurs verts", href: "/green/acteurs", iconKey: "Users" },
  { label: "Ressources", href: "/green/ressources", iconKey: "BookOpen" },
];

const FALLBACK_ECOSYSTEM_CARDS: EcosystemCard[] = [
  { title: "Annuaire économique", desc: "Répertoire des acteurs clés de la zone CEEAC", href: "/annuaire", badge: "Nouveau" },
  { title: "Opportunités d'affaires", desc: "Appels d'offres, partenariats et projets d'investissement en Afrique Centrale", href: "/appels-offres", badge: "Premium" },
  { title: "Communauté Habari", desc: "Réseau professionnel des entrepreneurs et décideurs d'Afrique Centrale", href: "/communaute", badge: "Gratuit" },
  { title: "Agenda & Événements", desc: "Conférences, forums et rendez-vous économiques en Afrique Centrale", href: "/evenements", badge: "Intégral" },
];

const GREEN_CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  BarChart3, TreePine, Zap, Landmark, Users, BookOpen,
};

const ECOSYSTEM_ICONS_ORDERED = [Globe2, Briefcase, Users, Calendar];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: dbArticles, isLoading: articlesLoading } = trpc.articles.list.useQuery({ limit: 3, offset: 0 });
  const { data: freeArticlesData } = trpc.articles.free.useQuery({ limit: 8, offset: 0 });
  const { data: premiumArticlesData } = trpc.articles.premium.useQuery({ limit: 4, offset: 0 });
  const { data: events } = trpc.events.upcoming.useQuery({ limit: 3 });
  const { data: hpSettings } = trpc.siteConfig.homepageSettings.useQuery({
    keys: ["homepage_hero_slides", "homepage_green_metrics", "homepage_green_categories", "homepage_ecosystem_cards", "homepage_magazine_featured"],
  });

  const heroSlides = useMemo<HeroSlide[]>(() => {
    try {
      if (hpSettings?.homepage_hero_slides) {
        const parsed = JSON.parse(hpSettings.homepage_hero_slides);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return FALLBACK_HERO_SLIDES;
  }, [hpSettings]);

  const greenMetrics = useMemo<GreenMetric[]>(() => {
    try { if (hpSettings?.homepage_green_metrics) return JSON.parse(hpSettings.homepage_green_metrics); } catch {}
    return FALLBACK_GREEN_METRICS;
  }, [hpSettings]);

  const greenCategories = useMemo<GreenCategory[]>(() => {
    try { if (hpSettings?.homepage_green_categories) return JSON.parse(hpSettings.homepage_green_categories); } catch {}
    return FALLBACK_GREEN_CATEGORIES;
  }, [hpSettings]);

  const ecosystemCards = useMemo<EcosystemCard[]>(() => {
    try { if (hpSettings?.homepage_ecosystem_cards) return JSON.parse(hpSettings.homepage_ecosystem_cards); } catch {}
    return FALLBACK_ECOSYSTEM_CARDS;
  }, [hpSettings]);

  const featuredMagazine = useMemo<HomepageMagazine>(() => {
    try { if (hpSettings?.homepage_magazine_featured) return JSON.parse(hpSettings.homepage_magazine_featured); } catch {}
    return {
      issueLabel: "Numéro 1 — Février 2026",
      coverUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/TDJnjIvMMFwogdcg.webp",
      pdfUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/pqeNdyKiCydqFTQF.pdf",
      pdfLabel: "67 pages — Gratuit",
      isFree: true,
    };
  }, [hpSettings]);

  const freeContent = (freeArticlesData && freeArticlesData.length > 0) ? freeArticlesData : FALLBACK_FREE_CONTENT;
  const premiumContent = (premiumArticlesData && premiumArticlesData.length > 0) ? premiumArticlesData : FALLBACK_PREMIUM_CONTENT;

  const [nlEmail, setNlEmail] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlDone, setNlDone] = useState(false);
  const subscribeMutation = trpc.newsletter.subscribe.useMutation();

  /* Bande défilante state */
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (heroSlides.length || 1));
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + (heroSlides.length || 1)) % (heroSlides.length || 1));
  }, [heroSlides.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

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

  const slide = heroSlides[currentSlide] ?? heroSlides[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════ HERO — FOND CLAIR + BANDE DÉFILANTE ═══════ */}
      <section className="relative overflow-hidden bg-[oklch(0.97_0.005_250)] border-b border-border">
        <div className="container py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left — Magazine presentation + download */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-primary">{featuredMagazine.issueLabel}</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[oklch(0.20_0.02_250)] leading-tight mb-4">
                Habari Magazine
              </h1>
              <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
              <p className="text-sm text-[oklch(0.35_0.02_250)] font-sans leading-relaxed mb-6">
                Connexion économique pour l'intégration de l'Afrique Centrale. Analyses de fond, données exclusives, réseau de décideurs.
              </p>

              {/* Cover + download */}
              <div className="flex items-start gap-4 mb-6">
                <Link href="/telecharger">
                  <img
                    src={featuredMagazine.coverUrl}
                    alt={`Couverture — ${featuredMagazine.issueLabel}`}
                    className="w-28 rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow cursor-pointer"
                  />
                </Link>
                <div className="flex-1">
                  <p className="font-serif font-bold text-sm text-foreground mb-1">{featuredMagazine.issueLabel}</p>
                  <p className="text-xs text-muted-foreground font-sans mb-3">{featuredMagazine.pdfLabel}</p>
                  <div className="flex flex-col gap-2">
                    {featuredMagazine.pdfUrl && (
                      <a href={featuredMagazine.pdfUrl} download target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="font-sans bg-primary hover:bg-primary/90 w-full text-xs">
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Télécharger le PDF
                        </Button>
                      </a>
                    )}
                    <Link href="/telecharger">
                      <Button size="sm" variant="outline" className="font-sans w-full text-xs border-primary/30 text-primary">
                        Tous les numéros
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <Link href="/abonnements">
                  <Button className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] w-full font-semibold">
                    Découvrir nos offres <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Bande défilante interactive (style Forbes) */}
            <div className="lg:col-span-8">
              <div
                className="relative rounded-xl overflow-hidden bg-[oklch(0.20_0.02_250)] h-full min-h-[380px] cursor-pointer"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-full object-cover object-top opacity-40 transition-all duration-700"
                    key={currentSlide}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.02_250)] via-[oklch(0.15_0.02_250)]/80 to-[oklch(0.18_0.02_250)]/50" />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                  <div className="mb-auto flex items-center justify-between pt-2">
                    <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.72_0.15_75)] bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                      {slide.rubrique}
                    </span>
                    <span className="text-xs font-sans text-white/40">
                      {currentSlide + 1} / {heroSlides.length}
                    </span>
                  </div>

                  <div>
                    {slide.slug ? (
                      <Link href={`/article/${slide.slug}`}>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight mb-3 hover:text-[oklch(0.72_0.15_75)] transition-colors cursor-pointer">
                          {slide.title}
                        </h2>
                      </Link>
                    ) : (
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                        {slide.title}
                      </h2>
                    )}
                    <p className="text-sm text-white/60 font-sans leading-relaxed mb-5 max-w-2xl line-clamp-2">
                      {slide.excerpt}
                    </p>

                    {/* Stats chips */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {Object.values(slide.stats ?? {}).filter(Boolean).map((val, i) => (
                        <span key={i} className="text-xs font-sans font-medium bg-white/10 backdrop-blur-sm text-white/80 px-3 py-1.5 rounded-full">
                          {val}
                        </span>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      {slide.slug && (
                        <Link href={`/article/${slide.slug}`}>
                          <Button size="sm" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)]">
                            Lire l'article <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                          aria-label="Slide précédent"
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                          aria-label="Slide suivant"
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bullet dots */}
                  <div className="flex items-center gap-1.5 mt-4">
                    {heroSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        aria-label={`Aller au slide ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentSlide ? "w-6 bg-[oklch(0.72_0.15_75)]" : "w-1.5 bg-white/30 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BANDE DÉFILANTE — ARTICLES CHAUDS (style Forbes) ═══════ */}
      <section className="bg-[oklch(0.97_0.005_250)] border-b border-border overflow-hidden py-3">
        <div className="relative">
          <div className="flex items-center">
            <div className="shrink-0 bg-primary text-white px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-wider z-10 mr-4">
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
              Les + lus
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex animate-marquee gap-12 whitespace-nowrap">
                {[...freeContent, ...freeContent].map((item, i) => (
                  <Link key={i} href={item.slug ? `/article/${item.slug}` : "/magazine"}>
                    <span className="inline-flex items-center gap-2 text-sm font-sans text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                      <span className="text-[oklch(0.72_0.15_75)] font-semibold text-xs">{(item as any).rubrique}</span>
                      <span className="text-muted-foreground/40">—</span>
                      <span className="font-medium">{item.title}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ARTICLES DU NUMÉRO ═══════ */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="habari-rubrique">Articles du magazine</span>
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
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-primary/25" />
                        </div>
                      )}
                      {item.minSubscriptionTier === "premium" ? (
                        <span className="absolute top-3 left-3 text-[0.6rem] font-sans bg-white/15 text-white border border-white/30 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm shadow-sm">
                          <Lock className="w-2.5 h-2.5" /> Premium
                        </span>
                      ) : item.minSubscriptionTier === "integral" ? (
                        <span className="absolute top-3 left-3 text-[0.6rem] font-sans bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Intégral
                        </span>
                      ) : (
                        <span className="absolute top-3 left-3 text-[0.6rem] font-sans bg-white/15 text-white border border-white/30 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm shadow-sm">
                          Accès libre
                        </span>
                      )}
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
            {greenMetrics.map((item) => (
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
            {greenCategories.map((sub, idx) => {
              const Icon = GREEN_CATEGORY_ICON_MAP[sub.iconKey] ?? BarChart3;
              return (
                <Link key={sub.href || idx} href={sub.href}>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors cursor-pointer group">
                    <Icon className="w-5 h-5 text-[oklch(0.75_0.18_145)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-sans text-white/70 group-hover:text-white transition-colors">{sub.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
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
            {!isAuthenticated && (
              <a href={"/login"}>
                <Button className="font-sans gap-2 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)]">
                  <Gift className="w-4 h-4" /> S'inscrire gratuitement
                </Button>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumContent.map((item, i) => (
              <div key={i} className="relative group">
                <Card className="border-0 shadow-sm overflow-hidden h-full opacity-90">
                  <div className="w-full h-52 bg-gradient-to-br from-[oklch(0.72_0.15_75)]/15 to-primary/10 relative overflow-hidden">
                    {((item as any).image || (item as any).featuredImage) ? (
                      <img src={(item as any).image ?? (item as any).featuredImage} alt={item.title} className="w-full h-full object-cover object-top opacity-70" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Lock className="w-10 h-10 text-[oklch(0.72_0.15_75)]/40" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[0.6rem] font-sans bg-white/15 text-white border border-white/30 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm shadow-sm">
                      <Gift className="w-3 h-3" /> Gratuit jusqu'au 1er juin
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <div className="habari-rubrique text-xs mb-2">{(item as any).rubrique}</div>
                    <h3 className="font-serif font-bold text-lg text-foreground leading-snug mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2">{item.excerpt}</p>
                  </CardContent>
                </Card>
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <a href={"/login"}>
                      <Button size="sm" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)]">
                        <Gift className="w-3.5 h-3.5 mr-1.5" /> S'inscrire pour lire
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ VOTRE ACCÈS HABARI (ex-Newsletter) ═══════ */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary/5 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary mb-3">
              Votre Accès Habari
            </h2>
            <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mx-auto mb-5"></div>
            <p className="text-muted-foreground font-sans mb-8 max-w-lg mx-auto">
              Choisissez la formule qui vous convient. Accédez aux analyses, données et événements de la zone CEEAC.
            </p>

            {/* Two tiers — redirectionnels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <Link href="/abonnements">
                <div className="border border-border rounded-xl p-6 bg-background hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer h-full group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors">Accès Gratuit</h3>
                      <span className="text-xs font-sans text-green-700 font-semibold">0 € / mois</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm font-sans text-muted-foreground mb-4">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Résumé hebdomadaire de l'actualité CEEAC</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> 1 analyse courte par semaine</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> Agenda des événements à venir</li>
                  </ul>
                  <div className="flex items-center gap-2 text-primary font-sans text-sm font-medium group-hover:gap-3 transition-all">
                    En savoir plus <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
              <Link href="/abonnements">
                <div className="border-2 border-[oklch(0.72_0.15_75)] rounded-xl p-6 bg-[oklch(0.72_0.15_75)]/5 relative hover:shadow-lg transition-all cursor-pointer h-full group">
                  <div className="absolute -top-3 right-4 bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] text-[0.6rem] font-sans font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Recommandé
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[oklch(0.72_0.15_75)]/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[oklch(0.55_0.12_75)]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-foreground group-hover:text-[oklch(0.55_0.12_75)] transition-colors">Accès Premium</h3>
                      <span className="text-xs font-sans text-[oklch(0.55_0.12_75)] font-semibold">À partir de 4,50 € / mois</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm font-sans text-muted-foreground mb-4">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Analyse approfondie hebdomadaire</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Données exclusives et tableaux de bord</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Accès aux archives complètes</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.15_75)] mt-0.5 shrink-0" /> Invitations événements Habari</li>
                  </ul>
                  <div className="flex items-center gap-2 text-[oklch(0.55_0.12_75)] font-sans text-sm font-medium group-hover:gap-3 transition-all">
                    Voir les offres <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Newsletter form — petite lucarne email */}
            <div className="bg-muted/30 border border-border rounded-xl p-6 max-w-lg mx-auto">
              <p className="text-sm font-sans text-muted-foreground mb-3">Inscrivez-vous gratuitement à la newsletter Habari</p>
              {nlDone ? (
                <div className="flex items-center justify-center gap-3 py-3 px-6 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-sans text-green-700 font-medium text-sm">Merci ! Vous recevrez notre prochaine newsletter.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <Button type="submit" disabled={nlLoading} className="font-sans bg-primary hover:bg-primary/90 px-5 text-sm">
                    {nlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire"}
                  </Button>
                </form>
              )}
              <p className="text-xs text-muted-foreground font-sans mt-2">Newsletter gratuite. Désabonnement en un clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ AGENDA ÉVÉNEMENTS ═══════ */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="habari-rubrique">Agenda</span>
                <span className="text-[0.6rem] font-sans bg-white/15 text-foreground border border-border px-2 py-0.5 rounded-full font-medium uppercase tracking-wider backdrop-blur-sm">Accès libre</span>
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
            {events && events.length > 0 ? events.map((ev: any, i: number) => (
              <div key={i} className="bg-background border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-center bg-primary/5 rounded-lg p-3 min-w-[60px]">
                    <div className="text-2xl font-serif font-bold text-primary">
                      {new Date(ev.startDate).getDate()}
                    </div>
                    <div className="text-xs text-muted-foreground font-sans uppercase">
                      {new Date(ev.startDate).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-foreground mb-1 line-clamp-2">{ev.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{ev.location}</p>
                    <span className="inline-block mt-2 text-xs font-sans px-2 py-1 bg-[oklch(0.72_0.15_75)]/10 text-[oklch(0.55_0.12_75)] rounded capitalize">{ev.type}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-10 text-muted-foreground font-sans text-sm">
                Aucun événement à venir pour le moment.
              </div>
            )}
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
            {ecosystemCards.map((svc, idx) => {
              const Icon = ECOSYSTEM_ICONS_ORDERED[idx] ?? Globe2;
              return (
                <Link key={svc.href || idx} href={svc.href}>
                  <div className="group bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer h-full relative">
                    {svc.badge && (
                      <span className="absolute top-3 right-3 text-[0.55rem] font-sans bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.55_0.12_75)] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                        {(svc.badge === "Premium" || svc.badge === "Intégral") && <Lock className="w-2.5 h-2.5" />} {svc.badge}
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-serif font-bold text-foreground mb-2">{svc.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{svc.desc}</p>
                  </div>
                </Link>
              );
            })}
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
              <a href={"/login"}>
                <Button size="lg" variant="outline" className="font-sans border-white/30 text-white hover:bg-white/10">
                  Créer un compte gratuit
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
