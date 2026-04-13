import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Mail, Crown, Search } from "lucide-react";
import { useState } from "react";

const tierLabels: Record<string, string> = { free: "Gratuite", premium: "Premium" };
const tierColors: Record<string, string> = {
  free: "bg-blue-100 text-blue-800",
  premium: "bg-[oklch(0.75_0.15_85)]/20 text-[oklch(0.45_0.15_85)]",
};

const statusLabels: Record<string, string> = { active: "Actif", unsubscribed: "Désabonné" };
const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  unsubscribed: "bg-gray-100 text-gray-600",
};

export default function AdminNewsletter() {
  const [tierFilter, setTierFilter] = useState("all");

  const { data: subscribers, isLoading } = trpc.admin.newsletter.list.useQuery({
    limit: 50,
    offset: 0,
    tier: tierFilter !== "all" ? tierFilter : undefined,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Abonnés Newsletter</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            Consultez et filtrez les abonnés à la newsletter Habari
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {["all", "free", "premium"].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-sm font-sans font-medium transition-colors ${
                tierFilter === tier
                  ? "bg-primary text-white"
                  : "bg-background border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {tier === "all" ? "Tous" : tierLabels[tier]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-9 h-9 bg-muted rounded-full" />
                  <div className="h-5 flex-1 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : !subscribers || subscribers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-sans">Aucun abonné trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Abonné</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Formule</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {sub.tier === "premium" ? (
                              <Crown className="w-4 h-4 text-[oklch(0.55_0.15_85)]" />
                            ) : (
                              <Mail className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-sans font-medium text-foreground text-sm">{sub.name || "Sans nom"}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground font-sans">{sub.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-sans font-medium ${tierColors[sub.tier]}`}>
                          {tierLabels[sub.tier]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-sans font-medium ${statusColors[sub.status]}`}>
                          {statusLabels[sub.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground font-sans">
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("fr-FR") : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
