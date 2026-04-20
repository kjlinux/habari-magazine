import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Clock, User, Bookmark, BookmarkCheck, Download } from "lucide-react";
import SocialShare from "@/components/SocialShare";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Paywall from "@/components/Paywall";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = trpc.articles.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: related } = trpc.articles.list.useQuery(
    { limit: 4, offset: 0 },
    { enabled: !!data?.article }
  );

  const article = data?.article || null;
  const access = data?.access || null;
  const accessAllowed = access?.allowed ?? true;

  const downloadMutation = trpc.articles.downloadUrl.useMutation({
    onSuccess: (res) => window.open(res.url, "_blank"),
    onError: (err) => toast.error(err.message || "Téléchargement impossible"),
  });

  const handleDownload = () => {
    if (!isAuthenticated) { toast.error("Connectez-vous pour télécharger l'article"); return; }
    if (slug) downloadMutation.mutate({ slug });
  };

  const { data: savedData, refetch: refetchSaved } = trpc.profile.isArticleSaved.useQuery(
    { articleId: article?.id ?? 0 },
    { enabled: isAuthenticated && !!article?.id }
  );
  const isSaved = savedData?.saved ?? false;

  const saveMutation = trpc.profile.saveArticle.useMutation({
    onSuccess: (res) => {
      toast.success(res.saved ? "Article sauvegardé" : "Article retiré des sauvegardes");
      refetchSaved();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const handleSave = () => {
    if (!isAuthenticated) { toast.error("Connectez-vous pour sauvegarder"); return; }
    if (article?.id) saveMutation.mutate({ articleId: article.id });
  };

  const readTime = article?.content
    ? `${Math.max(1, Math.round(article.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200))} min`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !article ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-xl font-serif font-bold text-foreground">Article introuvable</p>
          <Link href="/magazine">
            <Button variant="outline" className="gap-2 font-sans">
              <ArrowLeft className="w-4 h-4" /> Retour au magazine
            </Button>
          </Link>
        </div>
      ) : (
        <article>
          <Helmet>
            <title>{article.title} — Habari Magazine</title>
            <meta name="description" content={article.excerpt || ""} />
            <meta property="og:type" content="article" />
            <meta property="og:title" content={article.title} />
            <meta property="og:description" content={article.excerpt || ""} />
            {article.featuredImage && <meta property="og:image" content={article.featuredImage} />}
            <meta property="og:site_name" content="Habari Magazine" />
            <meta property="og:locale" content="fr_FR" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@HabariMag" />
            <meta name="twitter:title" content={article.title} />
            <meta name="twitter:description" content={article.excerpt || ""} />
            {article.featuredImage && <meta name="twitter:image" content={article.featuredImage} />}
          </Helmet>

          {/* Hero */}
          <header className="relative bg-[oklch(0.20_0.02_250)]">
            <div className="relative h-64 md:h-80 overflow-hidden">
              {article.featuredImage ? (
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover object-[center_20%]"
                />
              ) : (
                <div className="w-full h-full bg-primary/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.02_250)] via-[oklch(0.15_0.02_250)]/60 to-transparent" />
            </div>
            <div className="max-w-4xl mx-auto px-4 relative -mt-32 pb-12">
              <Link href="/magazine">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-6 font-sans gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retour au magazine
                </Button>
              </Link>
              {(article as any).category?.name && (
                <div className="habari-rubrique text-[oklch(0.42_0.18_10)] mb-4">
                  {(article as any).category.name}
                </div>
              )}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                {article.title}
              </h1>
              <div className="w-20 h-1 bg-[oklch(0.42_0.18_10)] mb-6" />
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 font-sans">
                {(article as any).author?.name && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {(article as any).author.name}
                    </span>
                    <span>•</span>
                  </>
                )}
                {readTime && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {readTime} de lecture
                    </span>
                    <span>•</span>
                  </>
                )}
                {article.publishedAt && (
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </header>

          <SocialShare title={article.title} excerpt={article.excerpt || ""} variant="sticky" />

          <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
            {article.excerpt && (
              <div className="habari-chapo mb-10 pb-8 border-b border-border">
                {article.excerpt}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <SocialShare title={article.title} excerpt={article.excerpt || ""} variant="bar" />
              <Button
                variant="outline" size="sm"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className={`font-sans gap-2 ${isSaved ? "text-primary border-primary" : "text-muted-foreground"}`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {isSaved ? "Sauvegardé" : "Sauvegarder"}
              </Button>
            </div>

            {!accessAllowed ? (
              <Paywall
                reason={(access?.reason as any) || "not_authenticated"}
                trialDaysRemaining={access?.trialDaysRemaining || 0}
                excerpt={article.excerpt}
              />
            ) : (
              <>
                <div
                  className="habari-prose"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                <div className="mt-8 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={downloadMutation.isPending}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isAuthenticated ? "Télécharger l'article (PDF)" : "Se connecter pour télécharger"}
                  </Button>
                </div>
              </>
            )}

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm font-sans font-medium text-muted-foreground mb-3">
                Cet article vous a intéressé ? Partagez-le :
              </p>
              <SocialShare title={article.title} excerpt={article.excerpt || ""} variant="bar" />
            </div>

            {/* Related articles */}
            {related && related.filter((a) => a.slug !== slug).length > 0 && (
              <div className="mt-16 pt-8 border-t border-border">
                <h3 className="font-serif font-bold text-primary text-xl mb-6">À lire également</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {related
                    .filter((a) => a.slug !== slug)
                    .slice(0, 4)
                    .map((a) => (
                      <Link key={a.id} href={`/article/${a.slug}`}>
                        <div className="p-5 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                          <div className="flex gap-4">
                            {a.featuredImage && (
                              <img
                                src={a.featuredImage}
                                alt=""
                                className="w-20 h-20 rounded-lg object-cover object-top shrink-0"
                              />
                            )}
                            <div>
                              {(a as any).category?.name && (
                                <div className="habari-rubrique text-xs mb-1">{(a as any).category.name}</div>
                              )}
                              <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {a.title}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </article>
      )}

      <Footer />
    </div>
  );
}
