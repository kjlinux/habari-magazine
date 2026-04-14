import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

import { trpc } from "@/lib/trpc";
import { Download, FileText, Eye, Calendar, BookOpen, ArrowRight, Lock, Crown, Shield, CheckCircle2, Gift, Clock, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const PDF_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/pqeNdyKiCydqFTQF.pdf";
const COVER_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/TDJnjIvMMFwogdcg.webp";

interface MagazineIssue {
  id: string;
  numero: string;
  date: string;
  title: string;
  description: string;
  pages: number;
  coverImage: string;
  pdfUrl: string;
  sommaire: string[];
  featured: boolean;
  accessLevel: "free" | "premium";
}

const magazines: MagazineIssue[] = [
  {
    id: "N000",
    numero: "N°000",
    date: "Juin 2024",
    title: "Mahamat Idriss Deby — Le pari de l'union et de la réconciliation nationale",
    description: "Le numéro inaugural de Habari Magazine. Au sommaire : la victoire de Mahamat Deby, le Tchad en quête d'unité, la crise de la CEDEAO, le boom de Canal+ en Afrique, interview d'Aché Ahmed Idriss (DG Sonexho), et les perspectives économiques du Tchad.",
    pages: 67,
    coverImage: COVER_URL,
    pdfUrl: PDF_URL,
    sommaire: [
      "Éditorial — Habari, fenêtre sur le Tchad",
      "À la Une — La victoire de Mahamat Deby",
      "Politique — Sénégal : quelle leçon pour l'Afrique ?",
      "Enquête — La crise de la CEDEAO",
      "Média — Le boom de Canal+ en Afrique",
      "Interview — Aché Ahmed Idriss, DG Sonexho",
      "Économie — Tchad : analyses et perspectives",
    ],
    featured: true,
    accessLevel: "free",
  },
];

/* Launch period banner */
function LaunchBanner() {
  const { data: launchStatus } = trpc.magazine.launchStatus.useQuery();
  const { isAuthenticated } = useAuth();

  if (!launchStatus?.isLaunchPeriod) return null;

  return (
    <div className="bg-gradient-to-r from-[oklch(0.72_0.15_75)] via-[oklch(0.68_0.14_65)] to-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)]">
      <div className="container py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <span className="font-sans font-bold text-sm">OFFRE DE LANCEMENT</span>
          </div>
          <span className="font-sans text-sm">
            Accès gratuit à tout le contenu premium pour les inscrits jusqu'au 1er juin 2026
          </span>
          <div className="flex items-center gap-1.5 bg-black/15 rounded-full px-3 py-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-sans text-xs font-semibold">{launchStatus.daysRemaining} jours restants</span>
          </div>
          {!isAuthenticated && (
            <a href={"/login"}>
              <Button size="sm" className="font-sans bg-[oklch(0.15_0.02_250)] text-white hover:bg-[oklch(0.25_0.02_250)] text-xs h-7">
                S'inscrire gratuitement
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* Component for access badge */
function AccessBadge({ level, isLaunchPeriod }: { level: "free" | "premium"; isLaunchPeriod?: boolean }) {
  if (level === "free") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-sans bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3" /> Gratuit
      </span>
    );
  }
  if (isLaunchPeriod) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-sans bg-[oklch(0.72_0.15_75)]/15 text-[oklch(0.45_0.12_75)] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
        <Gift className="w-3 h-3" /> Offre lancement
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-sans bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
      <Crown className="w-3 h-3" /> Premium
    </span>
  );
}

/* Download button with access control */
function DownloadButton({ issue }: { issue: MagazineIssue }) {
  const { isAuthenticated } = useAuth();
  const { data: access, isLoading } = trpc.magazine.checkAccess.useQuery({ issueId: issue.id });

  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" disabled className="font-sans w-full sm:w-auto opacity-50">
          <Download className="w-5 h-5 mr-2" /> Vérification...
        </Button>
      </div>
    );
  }

  // Free issue or user has access (including launch promo)
  if (access?.hasAccess) {
    return (
      <div className="space-y-4">
        {access.reason === "launch_promo" && (
          <div className="bg-gradient-to-r from-[oklch(0.72_0.15_75)]/10 to-[oklch(0.68_0.14_65)]/10 border border-[oklch(0.72_0.15_75)]/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[oklch(0.55_0.12_75)] mt-0.5 shrink-0" />
              <div>
                <p className="font-sans font-semibold text-[oklch(0.35_0.08_75)] text-sm mb-0.5">Accès offert — Période de lancement</p>
                <p className="text-xs font-sans text-[oklch(0.45_0.08_75)]">
                  Vous bénéficiez de l'accès gratuit au contenu premium jusqu'au 1er juin 2026. Profitez-en !
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <a href={issue.pdfUrl} download={`Habari-Magazine-${issue.numero}.pdf`} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="font-sans bg-primary hover:bg-primary/90 w-full sm:w-auto shadow-md">
              <Download className="w-5 h-5 mr-2" /> Télécharger le PDF
            </Button>
          </a>
          <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="font-sans border-primary/30 text-primary hover:bg-primary/5 w-full sm:w-auto">
              <Eye className="w-5 h-5 mr-2" /> Lire en ligne
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Not authenticated — during launch period, emphasize free registration
  if (!isAuthenticated) {
    const isLaunch = access?.isLaunchPeriod;
    return (
      <div className="space-y-4">
        <div className={`border rounded-xl p-5 ${isLaunch ? "bg-gradient-to-r from-[oklch(0.72_0.15_75)]/10 to-[oklch(0.68_0.14_65)]/10 border-[oklch(0.72_0.15_75)]/30" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-start gap-3">
            {isLaunch ? (
              <Gift className="w-5 h-5 text-[oklch(0.55_0.12_75)] mt-0.5 shrink-0" />
            ) : (
              <Lock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            )}
            <div>
              {isLaunch ? (
                <>
                  <p className="font-sans font-semibold text-[oklch(0.35_0.08_75)] mb-1">Inscrivez-vous pour accéder gratuitement !</p>
                  <p className="text-sm font-sans text-[oklch(0.45_0.08_75)]">
                    Pendant la période de lancement (jusqu'au 1er juin 2026), tout le contenu premium est accessible gratuitement aux utilisateurs inscrits. Créez votre compte en quelques secondes.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-sans font-semibold text-amber-800 mb-1">Contenu réservé aux abonnés Premium</p>
                  <p className="text-sm font-sans text-amber-700/80">
                    Connectez-vous ou créez un compte pour accéder à ce numéro avec un abonnement Premium.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={"/login"}>
            <Button size="lg" className={`font-sans w-full sm:w-auto ${isLaunch ? "bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)]" : "bg-primary hover:bg-primary/90"}`}>
              {isLaunch ? <><Gift className="w-4 h-4 mr-2" /> S'inscrire gratuitement</> : "Se connecter"}
            </Button>
          </a>
          {!isLaunch && (
            <Link href="/abonnements">
              <Button size="lg" variant="outline" className="font-sans border-primary/30 text-primary hover:bg-primary/5 w-full sm:w-auto">
                <Crown className="w-4 h-4 mr-2" /> Voir les abonnements
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Authenticated but no premium subscription (after launch period)
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Crown className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-sans font-semibold text-amber-800 mb-1">Accès réservé aux abonnés Premium</p>
            <p className="text-sm font-sans text-amber-700/80 mb-3">
              Ce numéro est exclusivement disponible pour les abonnés Premium et Enterprise.
              Passez à l'abonnement supérieur pour télécharger tous les numéros du magazine.
            </p>
            <ul className="space-y-1.5 text-sm font-sans text-amber-700/70">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Accès à tous les numéros en PDF</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Analyses exclusives et données premium</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Invitations aux événements Habari</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/abonnements">
          <Button size="lg" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] w-full sm:w-auto font-semibold shadow-md">
            <Crown className="w-4 h-4 mr-2" /> Passer à Premium
          </Button>
        </Link>
        <Button
          size="lg"
          variant="outline"
          className="font-sans border-muted-foreground/20 text-muted-foreground w-full sm:w-auto"
          onClick={() => toast.info("Consultez nos offres d'abonnement pour accéder à ce numéro.")}
        >
          <Lock className="w-4 h-4 mr-2" /> Téléchargement verrouillé
        </Button>
      </div>
    </div>
  );
}

/* Premium paywall overlay for cover image */
function CoverWithPaywall({ issue }: { issue: MagazineIssue }) {
  const { data: access } = trpc.magazine.checkAccess.useQuery({ issueId: issue.id });
  const hasAccess = access?.hasAccess;

  return (
    <div className="relative group">
      <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border bg-muted aspect-[3/4] max-w-sm mx-auto lg:mx-0">
        <img
          src={issue.coverImage}
          alt={`Couverture ${issue.numero}`}
          className={`w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ${
            !hasAccess && issue.accessLevel === "premium" ? "blur-[2px]" : ""
          }`}
        />
        {/* Overlay */}
        {hasAccess ? (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <a
              href={issue.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              <Button size="lg" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] shadow-lg">
                <Eye className="w-5 h-5 mr-2" /> Feuilleter en ligne
              </Button>
            </a>
          </div>
        ) : issue.accessLevel === "premium" ? (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-3">
              {access?.isLaunchPeriod ? (
                <Gift className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
            <span className="text-white font-sans font-semibold text-sm">
              {access?.isLaunchPeriod ? "Inscrivez-vous pour accéder" : "Réservé aux abonnés Premium"}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <a
              href={issue.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              <Button size="lg" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] shadow-lg">
                <Eye className="w-5 h-5 mr-2" /> Feuilleter en ligne
              </Button>
            </a>
          </div>
        )}
      </div>
      {/* Badge numéro + access level */}
      <div className="absolute -top-3 -right-3 lg:-right-6 flex flex-col items-end gap-2">
        <div className="bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] font-sans font-bold text-sm px-4 py-2 rounded-full shadow-lg">
          {issue.numero}
        </div>
        <AccessBadge level={issue.accessLevel} isLaunchPeriod={access?.isLaunchPeriod} />
      </div>
    </div>
  );
}

export default function Downloads() {
  const { data: launchStatus } = trpc.magazine.launchStatus.useQuery();
  const { data: dbIssues } = trpc.magazineIssues.list.useQuery();

  // Merge static N°000 with dynamic DB issues, DB issues take priority
  const allMagazines: MagazineIssue[] = (() => {
    const staticIssues = [...magazines];
    if (dbIssues && dbIssues.length > 0) {
      const dynamicIssues: MagazineIssue[] = dbIssues.map((issue: any) => ({
        id: issue.issueNumber.replace(/[^a-zA-Z0-9]/g, ''),
        numero: issue.issueNumber,
        date: issue.publishedAt ? new Date(issue.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '',
        title: issue.title,
        description: issue.description || '',
        pages: issue.pageCount || 0,
        coverImage: issue.coverUrl || COVER_URL,
        pdfUrl: issue.pdfUrl || '',
        sommaire: issue.sommaire ? issue.sommaire.split('·').map((s: string) => s.trim()).filter(Boolean) : [],
        featured: false,
        accessLevel: issue.isPremium ? 'premium' as const : 'free' as const,
      }));
      // Remove static issues that exist in DB (by numero match)
      const dbNumeros = new Set(dynamicIssues.map(d => d.numero));
      const filtered = staticIssues.filter(s => !dbNumeros.has(s.numero));
      // First dynamic issue is featured
      if (dynamicIssues.length > 0) dynamicIssues[0].featured = true;
      return [...filtered, ...dynamicIssues];
    }
    return staticIssues;
  })();

  const featuredIssues = allMagazines.filter(m => m.featured);
  const otherIssues = allMagazines.filter(m => !m.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LaunchBanner />

      {/* Hero */}
      <section className="bg-[oklch(0.20_0.02_250)] text-white py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[oklch(0.72_0.15_75)]" />
              <span className="text-[oklch(0.72_0.15_75)] font-sans text-sm font-semibold tracking-widest uppercase">
                Kiosque numérique
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
              Téléchargez Habari Magazine
            </h1>
            <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mb-6"></div>
            <p className="text-lg text-white/65 leading-relaxed font-sans">
              Retrouvez tous les numéros de Habari Magazine en version PDF. Le premier numéro est en accès libre.
              {launchStatus?.isLaunchPeriod ? (
                <> <strong className="text-[oklch(0.72_0.15_75)]">Offre de lancement : inscrivez-vous pour accéder gratuitement à tout le contenu premium jusqu'au 1er juin 2026.</strong></>
              ) : (
                <> Les numéros suivants sont réservés aux abonnés Premium.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Access legend */}
      <section className="border-b border-border">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm font-sans text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              Accès libre — téléchargement gratuit
            </span>
            {launchStatus?.isLaunchPeriod ? (
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.72_0.15_75)]"></span>
                Offre lancement — gratuit pour les inscrits jusqu'au 1er juin 2026
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Premium — abonnement requis
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Featured issue */}
      {featuredIssues.map((mag) => (
        <section key={mag.numero} className="py-16 md:py-20">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Cover image with paywall */}
              <CoverWithPaywall issue={mag} />

              {/* Details */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="habari-rubrique text-[oklch(0.72_0.15_75)]">Dernier numéro</span>
                  <span className="text-xs font-sans text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {mag.date}
                  </span>
                  <AccessBadge level={mag.accessLevel} isLaunchPeriod={launchStatus?.isLaunchPeriod} />
                </div>

                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4">
                  {mag.title}
                </h2>
                <div className="habari-separator mb-6"></div>

                <p className="text-foreground/70 font-sans leading-relaxed mb-8">
                  {mag.description}
                </p>

                {/* Sommaire */}
                <div className="bg-muted/40 border border-border rounded-xl p-6 mb-8">
                  <h3 className="font-serif font-bold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Sommaire
                  </h3>
                  <ul className="space-y-2.5">
                    {mag.sommaire.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-sans text-foreground/70">
                        <span className="text-[oklch(0.72_0.15_75)] font-bold mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-6 mb-8 text-sm font-sans text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> {mag.pages} pages
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Format PDF
                  </span>
                </div>

                {/* Download buttons with access control */}
                <DownloadButton issue={mag} />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Other published issues */}
      {otherIssues.length > 0 && (
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl font-bold text-primary">Tous les numéros</h2>
              <div className="habari-separator mx-auto mt-3"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherIssues.map((mag) => (
                <div key={mag.id} className="bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-[3/4] max-h-64 overflow-hidden">
                    <img src={mag.coverImage} alt={mag.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <AccessBadge level={mag.accessLevel} isLaunchPeriod={launchStatus?.isLaunchPeriod} />
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] font-sans font-bold text-xs px-3 py-1 rounded-full">{mag.numero}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-sans text-muted-foreground mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> {mag.date}</p>
                    <h3 className="font-serif font-bold text-foreground text-lg leading-tight mb-2 line-clamp-2">{mag.title}</h3>
                    <p className="text-sm font-sans text-muted-foreground line-clamp-2 mb-4">{mag.description}</p>
                    <DownloadButton issue={mag} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prochains numéros */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-primary">Prochains numéros</h2>
            <div className="habari-separator mx-auto mt-3"></div>
            <p className="text-muted-foreground font-sans mt-4 max-w-lg mx-auto">
              Habari Magazine est une publication trimestrielle.
              {launchStatus?.isLaunchPeriod ? (
                <> <strong>Pendant la période de lancement, tous les numéros sont accessibles gratuitement aux inscrits.</strong></>
              ) : (
                <> Les prochains numéros seront réservés aux abonnés Premium.</>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { numero: "N°001", date: "Février 2026", theme: "Panne sèche à la CEMAC", status: "En préparation", access: "premium" as const },
              { numero: "N°002", date: "Mai 2026", theme: "À définir", status: "Planifié", access: "premium" as const },
              { numero: "N°003", date: "Août 2026", theme: "À définir", status: "Planifié", access: "premium" as const },
            ].map((upcoming) => (
              <div key={upcoming.numero} className="bg-background border border-border rounded-xl p-6 text-center relative overflow-hidden">
                {/* Ribbon */}
                <div className="absolute top-0 right-0">
                  <div className={`text-white text-[0.5rem] font-sans font-bold px-6 py-1 transform rotate-45 translate-x-5 translate-y-2 ${
                    launchStatus?.isLaunchPeriod ? "bg-[oklch(0.55_0.12_75)]" : "bg-amber-500"
                  }`}>
                    {launchStatus?.isLaunchPeriod ? "GRATUIT" : "PREMIUM"}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  launchStatus?.isLaunchPeriod ? "bg-[oklch(0.72_0.15_75)]/15" : "bg-amber-100"
                }`}>
                  {launchStatus?.isLaunchPeriod ? (
                    <Gift className="w-5 h-5 text-[oklch(0.55_0.12_75)]" />
                  ) : (
                    <Crown className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div className="font-sans text-xs text-[oklch(0.72_0.15_75)] font-semibold uppercase tracking-wider mb-2">
                  {upcoming.numero}
                </div>
                <h3 className="font-serif font-bold text-foreground mb-1">{upcoming.date}</h3>
                <p className="text-sm text-muted-foreground font-sans mb-3">{upcoming.theme}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className={`inline-block text-xs font-sans px-3 py-1 rounded-full ${
                    upcoming.status === "En préparation"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {upcoming.status}
                  </span>
                  <AccessBadge level={upcoming.access} isLaunchPeriod={launchStatus?.isLaunchPeriod} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            {launchStatus?.isLaunchPeriod ? (
              <a href={"/login"}>
                <Button className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] font-semibold">
                  <Gift className="w-4 h-4 mr-2" /> S'inscrire pour accéder gratuitement
                </Button>
              </a>
            ) : (
              <Link href="/abonnements">
                <Button className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] font-semibold">
                  <Crown className="w-4 h-4 mr-2" /> S'abonner pour accéder à tous les numéros
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Premium benefits / Launch info */}
      <section className="py-16 border-t border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              {launchStatus?.isLaunchPeriod ? (
                <>
                  <div className="inline-flex items-center gap-2 bg-[oklch(0.72_0.15_75)]/15 rounded-full px-4 py-1.5 mb-4">
                    <Sparkles className="w-4 h-4 text-[oklch(0.55_0.12_75)]" />
                    <span className="text-sm font-sans font-semibold text-[oklch(0.45_0.12_75)]">Offre de lancement</span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-primary">Pourquoi s'inscrire maintenant ?</h2>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-1.5 mb-4">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-sans font-semibold text-amber-700">Abonnement Premium</span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-primary">Pourquoi passer à Premium ?</h2>
                </>
              )}
              <div className="habari-separator mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(launchStatus?.isLaunchPeriod ? [
                { icon: Gift, title: "Tout le contenu gratuit", desc: "Pendant la période de lancement, accédez à l'intégralité du contenu premium sans frais. Il suffit de créer un compte." },
                { icon: BookOpen, title: "Tous les numéros PDF", desc: "Téléchargez chaque numéro du magazine dès sa parution, en version PDF haute qualité." },
                { icon: FileText, title: "Analyses exclusives", desc: "Accédez aux dossiers approfondis, données exclusives et tableaux de bord économiques de la zone CEEAC." },
                { icon: Calendar, title: "Événements VIP", desc: "Recevez des invitations aux événements Habari : conférences, networking, formations." },
              ] : [
                { icon: BookOpen, title: "Tous les numéros PDF", desc: "Téléchargez chaque numéro du magazine dès sa parution, en version PDF haute qualité." },
                { icon: FileText, title: "Analyses exclusives", desc: "Accédez aux dossiers approfondis, données exclusives et tableaux de bord économiques." },
                { icon: Crown, title: "Archives complètes", desc: "Consultez l'intégralité des archives du magazine, sans limitation de durée." },
                { icon: Calendar, title: "Événements VIP", desc: "Recevez des invitations aux événements Habari : conférences, networking, formations." },
              ]).map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4 p-5 bg-muted/30 rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-lg bg-[oklch(0.72_0.15_75)]/15 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-[oklch(0.55_0.12_75)]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-sm font-sans text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              {launchStatus?.isLaunchPeriod ? (
                <a href={"/login"}>
                  <Button size="lg" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)] shadow-md">
                    Créer mon compte gratuitement <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              ) : (
                <Link href="/abonnements">
                  <Button size="lg" className="font-sans bg-primary hover:bg-primary/90 shadow-md">
                    Découvrir les offres Premium <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Vous souhaitez contribuer ?
          </h2>
          <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mx-auto mb-6"></div>
          <p className="text-white/70 font-sans max-w-xl mx-auto mb-8">
            Habari accueille les contributions d'experts, d'analystes et de professionnels de l'Afrique Centrale.
            Proposez un article, une tribune ou une analyse.
          </p>
          <Link href="/a-propos">
            <Button size="lg" className="font-sans bg-[oklch(0.72_0.15_75)] text-[oklch(0.15_0.02_250)] hover:bg-[oklch(0.78_0.15_75)]">
              Contacter la rédaction
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
