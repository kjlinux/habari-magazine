import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, BookOpen, Search, Lock } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  { id: "all", label: "Tous" },
  { id: "editorial", label: "Éditorial" },
  { id: "dossier", label: "Dossier Central" },
  { id: "interview", label: "Interviews" },
  { id: "business", label: "Business & Innovation" },
  { id: "analyse", label: "Analyse Pays" },
  { id: "culture", label: "Culture & Société" },
  { id: "green", label: "Habari Green" },
];

/* CDN image URLs */
const IMG = {
  cemac: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/cKOkqXwvCEGzMsUQ.jpg",
  gabon: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/ufPCeWOQxrZNjANy.jpg",
  ceeacVert: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/bouvLYpOwMPwrZVh.jpg",
  business: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/HdYjDeXbHfdvYVDK.jpg",
  cultureConcert: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/OddcsXlrdntxupnS.jpg",
  culturePortrait: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/MsiRkJOHcDfupLNH.jpg",
  ecoVerte: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/nlkVQeeaJhCivjDJ.jpg",
  emploisVerts: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/oTOnqHICldnZxqIH.jpg",
};

const sampleArticles = [
  { id: 1, rubrique: "Dossier Central", title: "Panne sèche à la CEMAC — Crise financière et ajustements budgétaires", excerpt: "La CEMAC traverse une crise existentielle. Suspension des activités de la Commission, arriérés de contributions, dette souveraine hors de contrôle.", slug: "cemac-panne-seche", date: "Février 2026", country: "CEMAC", access: "free", image: IMG.cemac },
  { id: 2, rubrique: "Enquête", title: "Gabon — Oligui Nguema face au mur de l'argent : la renaissance à crédit", excerpt: "Le Gabon affiche une ambition économique tous azimuts. Mais derrière la volonté politique se cache une équation plus dure.", slug: "gabon-oligui-mur-argent", date: "Février 2026", country: "Gabon", access: "free", image: IMG.gabon },
  { id: 3, rubrique: "Dossier Stratégique", title: "La CEEAC face au paradoxe vert — Capital naturel d'envergure mondiale", excerpt: "30 % des forêts tropicales mondiales, 107 GW de potentiel hydroélectrique, mais seulement 0,8 Md$ de finance verte captée par an.", slug: "ceeac-paradoxe-vert", date: "Février 2026", country: "CEEAC", access: "free", image: IMG.ceeacVert },
  { id: 4, rubrique: "Analyse Pays", title: "Tchad – Cameroun – Gabon : trajectoires comparées", excerpt: "Trois économies de la CEMAC, trois profils distincts, trois trajectoires qui illustrent la diversité de la région.", slug: "trajectoires-comparees", date: "Février 2026", country: "Tchad / Cameroun / Gabon", access: "premium", image: IMG.business },
  { id: 5, rubrique: "Éditorial", title: "La CEMAC à la croisée des chemins", excerpt: "La région dispose d'atouts considérables mais doit accélérer ses réformes structurelles pour attirer les investissements.", slug: "editorial-croisee-chemins", date: "Février 2026", country: "CEMAC", access: "premium" },
  { id: 6, rubrique: "Culture & Société", title: "Akendengué : le retour d'un homme devenu repère", excerpt: "Pierre Claver Akendengué, 82 ans, est remonté sur scène à l'Institut français de Libreville. Deux soirs où une mémoire s'est remise à chanter.", slug: "akendengue-voix-continent", date: "Février 2026", country: "Gabon", access: "premium", image: IMG.culturePortrait },
  { id: 7, rubrique: "Interview", title: "Dr Guy Gweth : « Aucune intégration ne progresse sans leadership et volonté de puissance »", excerpt: "Le Président du CAVIE dévoile les ressorts de la crise de la CEMAC et plaide pour un leadership assumé du Cameroun au service de l'intégration régionale.", slug: "interview-gweth-cemac", date: "Février 2026", country: "Cameroun", access: "premium", image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/kSvSfdRauRkMtfaJ.jpg" },
  { id: 8, rubrique: "Analyse Pays", title: "Le Gabon d'Oligui Nguema : entre promesses et réalités", excerpt: "Un an après la transition, le Gabon cherche à redéfinir son modèle économique.", slug: "gabon-oligui-nguema", date: "Février 2026", country: "Gabon", access: "premium" },
  { id: 9, rubrique: "La Grande Interview", title: "Loïc Mackosso : \u00ab Rester debout, c'est décider de se renforcer \u00bb", excerpt: "Banquier d'affaires et fondateur d'Aries Investissements, Loïc Mackosso livre un témoignage puissant sur la résilience, l'entrepreneuriat en Afrique et la reconstruction après la guerre civile au Congo.", slug: "interview-mackosso-rester-debout", date: "Février 2026", country: "Congo", access: "free", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/mackosso1_cropped_3c196986.jpg" },
  { id: 10, rubrique: "Habari Green", title: "L'économie verte, nouvelle doctrine de compétitivité pour l'Afrique Centrale", excerpt: "La transition climatique mondiale redistribue les cartes de la compétitivité économique. Pour la CEEAC, c'est une opportunité historique de repositionnement. Marchés carbone, minerais critiques, finance verte.", slug: "economie-verte-doctrine-competitivite", date: "Février 2026", country: "CEEAC", access: "free", image: IMG.ecoVerte },
  { id: 11, rubrique: "Business & Innovation", title: "Emplois verts en CEEAC : le potentiel existe, la structuration manque", excerpt: "Aquaculture, horticulture, hydroélectricité, énergie solaire : des initiatives portent leurs fruits. Mais transformer des projets isolés en moteur d'emploi régional exige bien davantage qu'un catalogue de bonnes pratiques.", slug: "emplois-verts-ceeac", date: "Février 2026", country: "CEEAC", access: "free", image: IMG.emploisVerts },
  { id: 12, rubrique: "Habari Green", title: "Cobalt et minerais stratégiques : bénédiction ou piège économique pour l'Afrique ?", excerpt: "Avec 70 % de la production mondiale de cobalt, l'Afrique est au c\u0153ur de la révolution énergétique. Mais la Chine contrôle 73 % du raffinage. Bénédiction ou nouveau piège extractif ?", slug: "cobalt-minerais-verts-afrique", date: "Février 2026", country: "RDC / CEEAC", access: "free", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/nhhpqOsQjMrA_e4729627.jpg" },
  { id: 13, rubrique: "Habari Green", title: "Les villes africaines face au défi climatique : entre contraintes et opportunités", excerpt: "Avec 700 millions de nouveaux citadins attendus d'ici 2050, l'Afrique doit construire des villes durables sans répéter les erreurs des pays industrialisés. BRT électrique, solutions fondées sur la nature, financements innovants.", slug: "villes-africaines-defi-climatique", date: "Février 2026", country: "Afrique", access: "free", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/GQwuI2Igxrdy_a1957686.jpg" },
  { id: 14, rubrique: "Culture & Société", title: "La montée des femmes entrepreneuses change-t-elle l'économie africaine ?", excerpt: "L'Afrique détient le taux d'entrepreneuriat féminin le plus élevé au monde. Pourtant, moins de 5 % du financement startup va à des CEO femmes. Entre dynamisme record et paradoxe du financement, enquête sur une force économique sous-estimée.", slug: "femmes-entrepreneuses-afrique", date: "Mars 2026", country: "Afrique", access: "free", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/q66ZJPQU1SQY_02c30c67.jpg" },
  { id: 15, rubrique: "Culture & Société", title: "La révolution du mobile money change-t-elle les comportements sociaux en Afrique ?", excerpt: "Avec 856 millions de comptes et 1 000 milliards de dollars de transactions annuelles, le mobile money redéfinit les solidarités familiales, l'autonomie des femmes et la frontière entre économie formelle et informelle.", slug: "revolution-mobile-money-afrique", date: "Mars 2026", country: "Afrique", access: "free", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663347570863/C6aFnP23nadn7BHJcaRyWP/qIZrLdK4gbPn_90cf748f.jpg" },
];

const accessFilters = [
  { id: "all", label: "Tous" },
  { id: "free", label: "Accès libre" },
  { id: "premium", label: "Premium" },
];

export default function Magazine() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeAccess, setActiveAccess] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dbArticles, isLoading } = trpc.articles.list.useQuery({ limit: 20, offset: 0 });

  const articles = dbArticles && dbArticles.length > 0 ? dbArticles : null;

  const filteredSamples = useMemo(() => {
    let filtered = sampleArticles;
    if (activeCategory !== "all") {
      const catMap: Record<string, string> = {
        editorial: "Éditorial", dossier: "Dossier Central", interview: "Interview",
        business: "Business & Innovation", analyse: "Analyse Pays", culture: "Culture & Société",
        green: "Habari Green",
      };
      filtered = filtered.filter((a) => a.rubrique === catMap[activeCategory]);
    }
    if (activeAccess !== "all") {
      filtered = filtered.filter((a) => a.access === activeAccess);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    return filtered;
  }, [activeCategory, activeAccess, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Magazine</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Habari Magazine</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Analyses, dossiers, interviews et portraits — le décryptage de l'économie de la zone CEEAC.
            <span className="block mt-2 text-sm text-white/40">Fréquence : 2-4 contenus par mois + baromètre mensuel. Qualité avant quantité.</span>
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col gap-3">
            {/* Category filters */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${
                      activeCategory === cat.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            {/* Access filters */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans text-muted-foreground mr-1">Accès :</span>
              {accessFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveAccess(f.id)}
                  className={`px-2.5 py-1 text-xs font-sans font-medium rounded-full transition-colors ${
                    activeAccess === f.id
                      ? f.id === "premium" ? "bg-[oklch(0.72_0.15_75)]/20 text-[oklch(0.55_0.12_75)]" : "bg-primary/10 text-primary"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {f.id === "premium" && <Lock className="w-3 h-3 inline mr-1" />}
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : articles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.id} href={`/article/${article.slug}`}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                      {article.featuredImage ? (
                        <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <BookOpen className="w-10 h-10 text-primary/30" />
                      )}
                      <span className={`absolute top-3 left-3 text-[0.6rem] font-sans px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                        article.minSubscriptionTier === 'free'
                          ? "bg-green-100 text-green-700"
                          : "bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.55_0.12_75)]"
                      }`}>
                        {article.minSubscriptionTier === 'free' ? 'Accès libre' : '🔒 Premium'}
                      </span>
                    </div>
                    <CardContent className="p-5">
                      <div className="habari-rubrique text-xs mb-2">Article</div>
                      <h3 className="font-serif font-bold text-lg text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                      {article.excerpt && <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">{article.excerpt}</p>}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-sans">
                          {article.publishedAt && new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <SocialShare
                          title={article.title}
                          excerpt={article.excerpt || ""}
                          url={`${window.location.origin}/article/${article.slug}`}
                          variant="compact"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <>
              {filteredSamples.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSamples.map((article) => (
                    <Link key={article.id} href={article.access === "free" ? `/article/${article.slug}` : "/abonnements"}>
                      <Card className={`group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full ${article.access === "premium" ? "opacity-90" : ""}`}>
                        <div className="w-full h-52 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                          {(article as any).image ? (
                            <img src={(article as any).image} alt={article.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                          ) : article.access === "premium" ? (
                            <div className="w-full h-full flex items-center justify-center"><Lock className="w-10 h-10 text-[oklch(0.72_0.15_75)]/30" /></div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-primary/30" /></div>
                          )}
                          <span className={`absolute top-3 left-3 text-[0.6rem] font-sans px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                            article.access === "free"
                              ? "bg-green-100 text-green-700"
                              : "bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.55_0.12_75)] flex items-center gap-1"
                          }`}>
                            {article.access === "premium" && <Lock className="w-3 h-3" />}
                            {article.access === "free" ? "Accès libre" : "Premium"}
                          </span>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="habari-rubrique text-xs">{article.rubrique}</span>
                            <span className="text-xs text-muted-foreground font-sans">• {article.country}</span>
                          </div>
                          <h3 className="font-serif font-bold text-lg text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">{article.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground font-sans">{article.date}</p>
                            <div className="flex items-center gap-2">
                              {article.access === "premium" && (
                                <span className="text-xs font-sans text-[oklch(0.55_0.12_75)] font-medium">S'abonner pour lire</span>
                              )}
                              {article.access === "free" && (
                                <SocialShare
                                  title={article.title}
                                  excerpt={article.excerpt}
                                  url={`${window.location.origin}/article/${article.slug}`}
                                  variant="compact"
                                />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-sans">Aucun article ne correspond à votre recherche.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
