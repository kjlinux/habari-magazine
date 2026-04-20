import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search as SearchIcon, Filter, X, Clock, User, Tag, Calendar, Lock, ChevronDown, Loader2 } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SearchPage() {
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const initialQuery = urlParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedRubrique, setSelectedRubrique] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedAccess, setSelectedAccess] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "readTime">("relevance");

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const { data: dbArticles, isLoading } = trpc.articles.list.useQuery({ limit: 200, offset: 0 });

  type ArticleItem = {
    slug: string;
    rubrique: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    access: string;
    image: string;
  };

  const allItems = useMemo<ArticleItem[]>(() => {
    if (!dbArticles) return [];
    return dbArticles.map((a: any) => ({
      slug: a.slug || `db-${a.id}`,
      rubrique: "Non classé",
      title: a.title,
      excerpt: a.excerpt || "",
      author: "La Rédaction Habari",
      date: a.publishedAt
        ? new Date(a.publishedAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        : a.createdAt
        ? new Date(a.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        : "2026",
      readTime: "5 min",
      access: a.minSubscriptionTier === "free" ? "free" : "premium",
      image: a.featuredImage || "",
    }));
  }, [dbArticles]);

  const allRubriques = useMemo(() => Array.from(new Set(allItems.map((a) => a.rubrique))).sort(), [allItems]);
  const allAuthors = useMemo(() => Array.from(new Set(allItems.map((a) => a.author))).sort(), [allItems]);
  const allDates = useMemo(() => Array.from(new Set(allItems.map((a) => a.date))), [allItems]);

  const results = useMemo(() => {
    let items = [...allItems];

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.rubrique.toLowerCase().includes(q)
      );
    }
    if (selectedRubrique !== "all") items = items.filter((a) => a.rubrique === selectedRubrique);
    if (selectedAuthor !== "all") items = items.filter((a) => a.author === selectedAuthor);
    if (selectedDate !== "all") items = items.filter((a) => a.date === selectedDate);
    if (selectedAccess !== "all") items = items.filter((a) => a.access === selectedAccess);

    if (sortBy === "date") {
      const monthOrder: Record<string, number> = {
        Janvier: 1, Février: 2, Mars: 3, Avril: 4, Mai: 5, Juin: 6,
        Juillet: 7, Août: 8, Septembre: 9, Octobre: 10, Novembre: 11, Décembre: 12,
      };
      items.sort((a, b) => {
        const [mA, yA] = a.date.split(" ");
        const [mB, yB] = b.date.split(" ");
        return (
          (parseInt(yB) || 2026) * 100 + (monthOrder[mB] || 0) -
          ((parseInt(yA) || 2026) * 100 + (monthOrder[mA] || 0))
        );
      });
    } else if (sortBy === "readTime") {
      items.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
    }

    return items;
  }, [allItems, query, selectedRubrique, selectedAuthor, selectedDate, selectedAccess, sortBy]);

  const activeFiltersCount = [selectedRubrique, selectedAuthor, selectedDate, selectedAccess].filter(
    (f) => f !== "all"
  ).length;

  const clearAllFilters = () => {
    setSelectedRubrique("all");
    setSelectedAuthor("all");
    setSelectedDate("all");
    setSelectedAccess("all");
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-[oklch(0.20_0.02_250)] py-12">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Recherche</div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Recherche avancée</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-6"></div>

          <div className="relative max-w-3xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé, titre, auteur, sujet..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full pl-12 pr-12 py-4 text-base font-sans bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.15_75)]/50 focus:border-[oklch(0.72_0.15_75)]/50 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters bar */}
      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-sans font-medium rounded-lg border transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-foreground/70 border-border hover:bg-muted"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-white text-primary rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                >
                  Effacer tout
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-sans text-muted-foreground hidden sm:block">
                {results.length} résultat{results.length !== 1 ? "s" : ""}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "relevance" | "date" | "readTime")}
                className="text-sm font-sans border border-border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="relevance">Pertinence</option>
                <option value="date">Date (récent)</option>
                <option value="readTime">Temps de lecture</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-2 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Tag className="w-3.5 h-3.5" /> Catégorie
                </label>
                <select
                  value={selectedRubrique}
                  onChange={(e) => setSelectedRubrique(e.target.value)}
                  className="w-full text-sm font-sans border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="all">Toutes les rubriques</option>
                  {allRubriques.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" /> Auteur
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="w-full text-sm font-sans border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="all">Tous les auteurs</option>
                  {allAuthors.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Période
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm font-sans border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="all">Toutes les dates</option>
                  {allDates.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Lock className="w-3.5 h-3.5" /> Accès
                </label>
                <select
                  value={selectedAccess}
                  onChange={(e) => setSelectedAccess(e.target.value)}
                  className="w-full text-sm font-sans border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="all">Tous les accès</option>
                  <option value="free">Accès libre</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Active filter tags */}
      {activeFiltersCount > 0 && (
        <div className="container pt-4">
          <div className="flex flex-wrap gap-2">
            {selectedRubrique !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-medium bg-primary/10 text-primary rounded-full">
                <Tag className="w-3 h-3" /> {selectedRubrique}
                <button onClick={() => setSelectedRubrique("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedAuthor !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-medium bg-primary/10 text-primary rounded-full">
                <User className="w-3 h-3" /> {selectedAuthor}
                <button onClick={() => setSelectedAuthor("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDate !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-medium bg-primary/10 text-primary rounded-full">
                <Calendar className="w-3 h-3" /> {selectedDate}
                <button onClick={() => setSelectedDate("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedAccess !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-medium bg-primary/10 text-primary rounded-full">
                <Lock className="w-3 h-3" /> {selectedAccess === "free" ? "Accès libre" : "Premium"}
                <button onClick={() => setSelectedAccess("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <section className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="font-sans text-sm">Chargement des articles...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Aucun résultat</h2>
            <p className="text-muted-foreground font-sans max-w-md mx-auto mb-6">
              {query
                ? `Aucun article ne correspond à « ${query} » avec les filtres sélectionnés.`
                : "Aucun article ne correspond aux filtres sélectionnés."}
            </p>
            <Button onClick={clearAllFilters} variant="outline" className="font-sans">
              Effacer tous les filtres
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((article) => (
              <Link key={article.slug} href={`/article/${article.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-primary/20">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {article.image && (
                        <div className="sm:w-56 md:w-64 h-48 sm:h-auto shrink-0 overflow-hidden">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="flex-1 p-5 md:p-6">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`text-xs font-sans font-bold uppercase tracking-wider ${
                              article.rubrique.includes("Green")
                                ? "text-[oklch(0.45_0.15_145)]"
                                : "text-[oklch(0.72_0.15_75)]"
                            }`}
                          >
                            {article.rubrique}
                          </span>
                          {article.access === "premium" && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-sans font-medium bg-[oklch(0.72_0.15_75)]/10 text-[oklch(0.55_0.15_75)] rounded-full">
                              Premium
                            </span>
                          )}
                          {article.access === "free" && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-sans font-medium bg-green-50 text-green-700 rounded-full">
                              Accès libre
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-sm font-sans text-muted-foreground line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-sans text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {article.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
