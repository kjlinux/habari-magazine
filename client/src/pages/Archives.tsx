import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Rubrique labels ────────────────────────────────────────
const RUBRIQUES: Record<string, { label: string; color: string }> = {
  "dossier-central": { label: "Dossier Central", color: "bg-red-600" },
  "analyse-pays": { label: "Analyse Pays", color: "bg-habari-blue" },
  "interview": { label: "Interview", color: "bg-purple-600" },
  "business-innovation": { label: "Business & Innovation", color: "bg-emerald-600" },
  "culture-societe": { label: "Culture & Société", color: "bg-habari-gold" },
  "editorial": { label: "Éditorial", color: "bg-gray-600" },
};

function getRubriqueFromCategory(slug: string | undefined): { label: string; color: string } {
  if (!slug) return { label: "Article", color: "bg-gray-500" };
  return RUBRIQUES[slug] ?? { label: slug, color: "bg-gray-500" };
}

export default function Archives() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("articles");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // Fetch categories and years for filters
  const { data: categories } = trpc.archives.categories.useQuery();
  const { data: years } = trpc.archives.years.useQuery();

  // Fetch articles with filters
  const articleFilters = useMemo(() => ({
    categoryId: selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
    year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
    search: searchQuery || undefined,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  }), [selectedCategory, selectedYear, searchQuery, page]);

  const { data: articlesData, isLoading: articlesLoading } = trpc.archives.articles.useQuery(articleFilters);

  // Fetch magazine issues
  const issueFilters = useMemo(() => ({
    year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
    search: searchQuery || undefined,
  }), [selectedYear, searchQuery]);

  const { data: issues, isLoading: issuesLoading } = trpc.archives.issues.useQuery(issueFilters);

  // Launch period info
  const { data: launchStatus } = trpc.magazine.launchStatus.useQuery();

  const totalPages = articlesData ? Math.ceil(articlesData.total / ITEMS_PER_PAGE) : 0;

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedYear("all");
    setSearchQuery("");
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-habari-dark text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(212,160,23,0.1) 35px, rgba(212,160,23,0.1) 70px)"
          }} />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-habari-gold/20 text-habari-gold border-habari-gold/30 mb-4">
              Bibliothèque numérique
            </Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Archives Habari
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Retrouvez l'intégralité des articles, dossiers et numéros du magazine Habari.
              Filtrez par rubrique, année ou mot-clé pour accéder à nos analyses sur l'économie d'Afrique Centrale.
            </p>
            {launchStatus?.isLaunchPeriod && (
              <div className="mt-6 inline-flex items-center gap-2 bg-habari-gold/20 border border-habari-gold/30 rounded-lg px-4 py-2">
                <span className="text-habari-gold font-semibold text-sm">
                  Offre de lancement — Accès gratuit à toutes les archives jusqu'au 1er juin 2026
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border bg-card sticky top-0 z-20">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder="Rechercher dans les archives..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(0); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Toutes les rubriques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les rubriques</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year filter */}
            <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setPage(0); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Toutes les années" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {years?.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset */}
            {(selectedCategory !== "all" || selectedYear !== "all" || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="articles" className="px-6">
              Articles
              {articlesData && (
                <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                  {articlesData.total ?? 0}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="issues" className="px-6">
              Numéros du magazine
              {issues && (
                <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                  {issues.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles">
            {articlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                    <div className="h-48 bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articlesData && articlesData.articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articlesData.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} categories={categories} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Précédent
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                        const pageNum = totalPages <= 7 ? i : (
                          page < 3 ? i :
                          page > totalPages - 4 ? totalPages - 7 + i :
                          page - 3 + i
                        );
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-9"
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="Aucun article trouvé"
                description="Aucun article ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                onReset={resetFilters}
              />
            )}
          </TabsContent>

          {/* Magazine Issues Tab */}
          <TabsContent value="issues">
            {issuesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                    <div className="h-72 bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-5 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : issues && issues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} user={user} launchPeriod={launchStatus?.isLaunchPeriod} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucun numéro trouvé"
                description="Aucun numéro du magazine ne correspond à vos critères. Essayez de modifier vos filtres."
                onReset={resetFilters}
              />
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-habari-dark text-white py-16">
          <div className="container text-center max-w-2xl">
            <h2 className="font-serif text-3xl font-bold mb-4">
              Accédez à l'intégralité des archives
            </h2>
            <p className="text-gray-300 mb-6">
              Inscrivez-vous gratuitement pour profiter de l'offre de lancement et accéder à tous les contenus premium jusqu'au 1er juin 2026.
            </p>
            <a href={"/login"} className="inline-block">
              <Button size="lg" className="bg-habari-gold hover:bg-habari-gold/90 text-habari-dark font-semibold px-8">
                Créer un compte gratuit
              </Button>
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Article Card Component ──────────────────────────────────
function ArticleCard({ article, categories }: { article: any; categories: any[] | undefined }) {
  const { user } = useAuth();
  const category = categories?.find((c) => c.id === article.categoryId);
  const rubrique = getRubriqueFromCategory(category?.slug);
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const isPremium = article.minSubscriptionTier !== "free";
  const targetHref =
    isPremium && !user
      ? `/login?redirect=${encodeURIComponent(`/article/${article.slug}`)}`
      : `/article/${article.slug}`;

  return (
    <Link href={targetHref}>
      <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-habari-gold/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-habari-blue/20 to-habari-gold/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
          {/* Rubrique badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${rubrique.color} text-white text-xs`}>
              {rubrique.label}
            </Badge>
          </div>
          {/* Access badge */}
          {article.minSubscriptionTier !== "free" && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-black/60 text-habari-gold border-habari-gold/50 text-xs">
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-serif text-lg font-bold leading-tight mb-2 group-hover:text-habari-gold transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border">
            {publishedDate && <span>{publishedDate}</span>}
            {article.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.viewCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Issue Card Component ──────────────────────────────────
function IssueCard({ issue, user, launchPeriod }: { issue: any; user: any; launchPeriod?: boolean }) {
  const publishedDate = issue.publishedAt
    ? new Date(issue.publishedAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : null;

  const canAccess = !issue.isPremium || user || launchPeriod;

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-habari-gold/50 hover:shadow-lg transition-all duration-300">
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {issue.coverUrl ? (
          <img
            src={issue.coverUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-habari-blue to-habari-dark flex flex-col items-center justify-center text-white p-6 text-center">
            <span className="text-5xl font-serif font-bold mb-2">H</span>
            <span className="text-sm font-semibold tracking-wider uppercase">{issue.issueNumber}</span>
            <span className="text-xs mt-1 opacity-70">{issue.title}</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-habari-blue text-white text-xs">
            {issue.issueNumber}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          {issue.isPremium ? (
            <Badge className="bg-habari-gold text-habari-dark text-xs font-semibold">
              Premium
            </Badge>
          ) : (
            <Badge className="bg-emerald-600 text-white text-xs">
              Gratuit
            </Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-serif text-base font-bold leading-tight mb-1 line-clamp-2">
          {issue.title}
        </h3>
        {publishedDate && (
          <p className="text-xs text-muted-foreground mb-3">{publishedDate}</p>
        )}
        {issue.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {issue.description}
          </p>
        )}
        <div className="flex gap-2">
          {canAccess && issue.pdfUrl ? (
            <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" className="w-full bg-habari-blue hover:bg-habari-blue/90 text-white text-xs">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger
              </Button>
            </a>
          ) : !canAccess ? (
            <Link href="/abonnements" className="flex-1">
              <Button size="sm" variant="outline" className="w-full border-habari-gold text-habari-gold hover:bg-habari-gold/10 text-xs">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                S'abonner
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" className="flex-1 text-xs" disabled>
              Bientôt disponible
            </Button>
          )}
          <Link href="/telecharger">
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">
              Détails
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State Component ──────────────────────────────────
function EmptyState({ title, description, onReset }: { title: string; description: string; onReset: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="font-serif text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      <Button variant="outline" onClick={onReset}>
        Réinitialiser les filtres
      </Button>
    </div>
  );
}
