import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, BookOpen, Search, Lock } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const accessFilters = [
  { id: "all", label: "Tous" },
  { id: "free", label: "Accès libre" },
  { id: "premium", label: "Premium" },
];

export default function Magazine() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">("all");
  const [activeAccess, setActiveAccess] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = trpc.archives.categories.useQuery();
  const { data: allArticles, isLoading } = trpc.articles.list.useQuery({ limit: 100, offset: 0 });

  const filtered = useMemo(() => {
    if (!allArticles) return [];
    let list = allArticles;

    if (activeCategoryId !== "all") {
      list = list.filter((a) => (a as any).categoryId === activeCategoryId);
    }
    if (activeAccess === "free") {
      list = list.filter((a) => a.minSubscriptionTier === "free");
    } else if (activeAccess === "premium") {
      list = list.filter((a) => a.minSubscriptionTier !== "free");
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || (a.excerpt || "").toLowerCase().includes(q));
    }
    return list;
  }, [allArticles, activeCategoryId, activeAccess, searchQuery]);

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
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                <button
                  onClick={() => setActiveCategoryId("all")}
                  className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${
                    activeCategoryId === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Tous
                </button>
                {categories?.map((cat: { id: number; name: string }) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${
                      activeCategoryId === cat.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.name}
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">Aucun article ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => (
                <Link key={article.id} href={`/article/${article.slug}`}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                      {article.featuredImage ? (
                        <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <BookOpen className="w-10 h-10 text-primary/30" />
                      )}
                      <span className={`absolute top-3 left-3 text-[0.6rem] font-sans px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                        article.minSubscriptionTier === "free"
                          ? "bg-green-100 text-green-700"
                          : "bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.55_0.12_75)]"
                      }`}>
                        {article.minSubscriptionTier === "free" ? "Accès libre" : "🔒 Premium"}
                      </span>
                    </div>
                    <CardContent className="p-5">
                      {(article as any).category?.name && (
                        <div className="habari-rubrique text-xs mb-2">{(article as any).category.name}</div>
                      )}
                      <h3 className="font-serif font-bold text-lg text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-sans">
                          {article.publishedAt && new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
