import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { FileText, Users, Mail, TrendingUp, Eye, PenLine, BookOpen, Download, CreditCard, CheckCircle } from "lucide-react";
import { Link } from "wouter";

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="bg-background border border-border rounded-xl p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-[oklch(0.75_0.15_85)]/15 text-[oklch(0.55_0.15_85)]" : "bg-primary/10 text-primary"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold font-serif text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground font-sans mt-0.5">{label}</p>
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: "Publié", className: "bg-green-100 text-green-700" },
  draft: { label: "Brouillon", className: "bg-yellow-100 text-yellow-700" },
  archived: { label: "Archivé", className: "bg-gray-100 text-gray-500" },
};

const TIER_LABELS: Record<string, { label: string; className: string }> = {
  free: { label: "Libre", className: "bg-blue-100 text-blue-600" },
  standard: { label: "Standard", className: "bg-purple-100 text-purple-600" },
  premium: { label: "Premium", className: "bg-amber-100 text-amber-700" },
  enterprise: { label: "Enterprise", className: "bg-red-100 text-red-700" },
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            Vue d'ensemble de la plateforme Habari
          </p>
        </div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-7 w-16 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={FileText} label="Articles totaux" value={stats?.totalArticles ?? 0} />
            <StatCard icon={Eye} label="Articles publiés" value={stats?.publishedArticles ?? 0} accent />
            <StatCard icon={PenLine} label="Brouillons" value={stats?.draftArticles ?? 0} />
            <StatCard icon={Users} label="Utilisateurs" value={stats?.totalUsers ?? 0} />
            <StatCard icon={Mail} label="Abonnés newsletter" value={stats?.totalSubscribers ?? 0} accent />
            <StatCard icon={TrendingUp} label="Abonnés premium" value={stats?.premiumSubscribers ?? 0} />
            <StatCard icon={BookOpen} label="Numéros magazine" value={stats?.totalMagazineIssues ?? 0} accent />
            <StatCard icon={Download} label="Téléchargements PDF" value={stats?.totalDownloads ?? 0} />
            <StatCard icon={CheckCircle} label="Abonnements actifs" value={stats?.activeSubscriptions ?? 0} accent />
          </div>
        )}

        {/* Recent articles */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-foreground">Articles récents</h2>
            <Link href="/admin/articles" className="text-sm text-primary hover:underline font-sans">Voir tous</Link>
          </div>
          <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
              </div>
            ) : !stats?.recentArticles?.length ? (
              <p className="text-sm text-muted-foreground p-6 font-sans">Aucun article pour l'instant.</p>
            ) : (
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Titre</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden sm:table-cell">Accès</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentArticles.map((a) => {
                    const status = STATUS_LABELS[a.status] ?? { label: a.status, className: "bg-gray-100 text-gray-500" };
                    const tier = TIER_LABELS[a.minSubscriptionTier] ?? { label: a.minSubscriptionTier, className: "bg-gray-100 text-gray-500" };
                    return (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/admin/articles/${a.id}`} className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                            {a.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tier.className}`}>{tier.label}</span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.className}`}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-serif font-bold text-foreground mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="/admin/articles/nouveau" className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <PenLine className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-sans font-medium text-foreground">Nouvel article</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Créer et publier un article</p>
                </div>
              </div>
            </a>
            <a href="/admin/utilisateurs" className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-sans font-medium text-foreground">Gérer les utilisateurs</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Rôles et abonnements</p>
                </div>
              </div>
            </a>
            <a href="/admin/magazine" className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-sans font-medium text-foreground">Magazine PDF</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Gérer les numéros</p>
                </div>
              </div>
            </a>
            <a href="/admin/newsletter" className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-sans font-medium text-foreground">Newsletter</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Voir les abonnés</p>
                </div>
              </div>
            </a>
            <a href="/admin/parametres" className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-sans font-medium text-foreground">Paramètres</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Abonnements & promo</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
