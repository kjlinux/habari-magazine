import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Mic2, User, Lock } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Tribunes() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = trpc.archives.categories.useQuery();
  const { data: allArticles, isLoading } = trpc.articles.list.useQuery({ limit: 200, offset: 0 });

  const tribunesCategory = useMemo(() => {
    if (!categories) return null;
    return categories.find(
      (c: { id: number; name: string; slug?: string }) =>
        c.name.toLowerCase().includes("tribune") ||
        (c as any).slug?.toLowerCase().includes("tribune")
    );
  }, [categories]);

  const filtered = useMemo(() => {
    if (!allArticles || !tribunesCategory) return [];
    let list = allArticles.filter(
      (a) => (a as any).categoryId === tribunesCategory.id
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt || "").toLowerCase().includes(q) ||
          ((a as any).author?.name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allArticles, tribunesCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Premium</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Tribunes
          </h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Les prises de position et analyses exclusives des décideurs, experts et dirigeants qui façonnent l'économie de l'Afrique Centrale.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher par titre ou auteur..."
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
          ) : !tribunesCategory ? (
            <div className="text-center py-20">
              <Mic2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">Catégorie "Tribune" non configurée.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Mic2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">Aucune tribune ne correspond à votre recherche.</p>
              {searchQuery && (
                <Button variant="ghost" className="mt-4 font-sans" onClick={() => setSearchQuery("")}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-sans mb-6">
                {filtered.length} tribune{filtered.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((article) => {
                  const isLocked = (article as any).access && !(article as any).access.allowed;
                  const CardWrapper = isLocked
                    ? ({ children }: { children: React.ReactNode }) => (
                        <Link href="/abonnements"><div className="block">{children}</div></Link>
                      )
                    : ({ children }: { children: React.ReactNode }) => (
                        <Link href={`/article/${article.slug}`}><div className="block">{children}</div></Link>
                      );
                  return (
                    <CardWrapper key={article.id}>
                      <Card className={`group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full cursor-pointer ${isLocked ? "opacity-80" : ""}`}>
                        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                          {article.featuredImage ? (
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Mic2 className="w-10 h-10 text-primary/30" />
                          )}
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Lock className="w-8 h-8 text-white/80" />
                            </div>
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
                        </div>
                        <CardContent className="p-5">
                          {(article as any).author?.name && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <User className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-sans text-muted-foreground font-medium">
                                {(article as any).author.name}
                              </span>
                              {(article as any).author?.jobTitle && (
                                <span className="text-xs font-sans text-muted-foreground/60">
                                  — {(article as any).author.jobTitle}
                                </span>
                              )}
                            </div>
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
                            {!isLocked && (
                              <SocialShare
                                title={article.title}
                                excerpt={article.excerpt || ""}
                                url={`${window.location.origin}/article/${article.slug}`}
                                variant="compact"
                              />
                            )}
                          </div>
                          {isLocked && (
                            <p className="text-xs text-[oklch(0.55_0.12_75)] font-sans font-medium mt-2">
                              Réservé aux abonnés Premium — S'abonner →
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </CardWrapper>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
