import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, BookOpen, Search, Globe } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AnalysesPays() {
  const [selectedCountryId, setSelectedCountryId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = trpc.archives.categories.useQuery();
  const { data: countries } = trpc.countries.list.useQuery();
  const { data: allArticles, isLoading } = trpc.articles.list.useQuery({ limit: 200, offset: 0 });

  const analysesPaysCategory = useMemo(() => {
    if (!categories) return null;
    return categories.find(
      (c: { id: number; name: string; slug?: string }) =>
        c.name.toLowerCase().includes("analyse") ||
        (c as any).slug?.toLowerCase().includes("analyse")
    );
  }, [categories]);

  const filtered = useMemo(() => {
    if (!allArticles || !analysesPaysCategory) return [];
    let list = allArticles.filter(
      (a) => (a as any).categoryId === analysesPaysCategory.id
    );
    if (selectedCountryId !== "all") {
      list = list.filter((a) => (a as any).countryId === selectedCountryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allArticles, analysesPaysCategory, selectedCountryId, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Premium</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Analyses Pays
          </h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Décryptages approfondis des économies de la zone CEEAC — données macroéconomiques, enjeux sectoriels et perspectives d'investissement par pays.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              <button
                onClick={() => setSelectedCountryId("all")}
                className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${
                  selectedCountryId === "all"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Tous les pays
              </button>
              {countries?.map((country: { id: number; name: string; flag: string | null }) => (
                <button
                  key={country.id}
                  onClick={() => setSelectedCountryId(country.id)}
                  className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${
                    selectedCountryId === country.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {country.flag ? `${country.flag} ` : ""}{country.name}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64 md:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une analyse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
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
          ) : !analysesPaysCategory ? (
            <div className="text-center py-20">
              <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">Catégorie "Analyse Pays" non configurée.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">Aucune analyse ne correspond à votre recherche.</p>
              <Button
                variant="ghost"
                className="mt-4 font-sans"
                onClick={() => { setSelectedCountryId("all"); setSearchQuery(""); }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-sans mb-6">
                {filtered.length} analyse{filtered.length > 1 ? "s" : ""}
                {selectedCountryId !== "all" && countries && ` — ${countries.find((c: { id: number; name: string }) => c.id === selectedCountryId)?.name}`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((article) => (
                  <Link key={article.id} href={`/article/${article.slug}`}>
                    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                      <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                        {article.featuredImage ? (
                          <img
                            src={article.featuredImage}
                            alt={article.title}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <Globe className="w-10 h-10 text-primary/30" />
                        )}
                        <span
                          className={`absolute top-3 left-3 text-[0.6rem] font-sans px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                            article.minSubscriptionTier === "free"
                              ? "bg-green-100 text-green-700"
                              : "bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.55_0.12_75)]"
                          }`}
                        >
                          {article.minSubscriptionTier === "free" ? "Accès libre" : "Premium"}
                        </span>
                        {(article as any).country?.flag && (
                          <span className="absolute top-3 right-3 text-xl">
                            {(article as any).country.flag}
                          </span>
                        )}
                      </div>
                      <CardContent className="p-5">
                        {(article as any).country?.name && (
                          <div className="habari-rubrique text-xs mb-2">{(article as any).country.name}</div>
                        )}
                        <h3 className="font-serif font-bold text-lg text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground font-sans">
                            {article.publishedAt &&
                              new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
