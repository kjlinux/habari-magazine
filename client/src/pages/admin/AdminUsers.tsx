import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Search, Shield, ShieldCheck, Crown } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = { user: "Utilisateur", admin: "Administrateur" };
const roleColors: Record<string, string> = { user: "bg-blue-100 text-blue-800", admin: "bg-red-100 text-red-800" };

const tierLabels: Record<string, string> = { free: "Gratuit", standard: "Standard", premium: "Premium", enterprise: "Entreprise" };
const tierColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  standard: "bg-purple-100 text-purple-800",
  premium: "bg-[oklch(0.75_0.15_85)]/20 text-[oklch(0.45_0.15_85)]",
  enterprise: "bg-primary/10 text-primary",
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const utils = trpc.useUtils();

  // Simple debounce
  const searchTimeout = useMemo(() => {
    return (val: string) => {
      setSearch(val);
      setTimeout(() => setDebouncedSearch(val), 300);
    };
  }, []);

  const { data: users, isLoading } = trpc.admin.users.list.useQuery({
    limit: 50,
    offset: 0,
    search: debouncedSearch || undefined,
  });

  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle mis à jour");
      utils.admin.users.list.invalidate();
    },
    onError: () => toast.error("Erreur lors de la mise à jour du rôle"),
  });

  const updateSubMutation = trpc.admin.users.updateSubscription.useMutation({
    onSuccess: () => {
      toast.success("Abonnement mis à jour");
      utils.admin.users.list.invalidate();
    },
    onError: () => toast.error("Erreur lors de la mise à jour de l'abonnement"),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground font-sans mt-1">
            Gérez les rôles et abonnements des utilisateurs
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => searchTimeout(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-9 h-9 bg-muted rounded-full" />
                  <div className="h-5 flex-1 bg-muted rounded" />
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="h-5 w-24 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : !users || users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-sans">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">Rôle</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Abonnement</th>
                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-primary">
                              {u.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-sans font-medium text-foreground text-sm">{u.name || "Sans nom"}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{u.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground font-sans">{u.email || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => updateRoleMutation.mutate({ userId: u.id, role: e.target.value as "user" | "admin" })}
                          className={`px-2 py-1 rounded-lg text-xs font-sans font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${roleColors[u.role]}`}
                        >
                          <option value="user">Utilisateur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <select
                          value={u.subscriptionTier}
                          onChange={(e) => updateSubMutation.mutate({ userId: u.id, tier: e.target.value as any })}
                          className={`px-2 py-1 rounded-lg text-xs font-sans font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${tierColors[u.subscriptionTier]}`}
                        >
                          <option value="free">Gratuit</option>
                          <option value="standard">Standard</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Entreprise</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground font-sans">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}
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
