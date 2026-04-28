import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, Users, Mail, ChevronLeft,
  LogOut, Menu, X, Shield, MessageSquare, BookOpen, Megaphone, Settings,
  CalendarDays, UserCheck, Bell, BookUser, TrendingUp, Handshake, UsersRound
} from "lucide-react";
import { useState, useEffect } from "react";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/admin" },
  { icon: FileText, label: "Articles", path: "/admin/articles" },
  { icon: BookOpen, label: "Magazine PDF", path: "/admin/magazine" },
  { icon: UserCheck, label: "Auteurs", path: "/admin/auteurs" },
  { icon: CalendarDays, label: "Événements", path: "/admin/evenements" },
  { icon: UsersRound, label: "Communauté", path: "/admin/communaute" },
  { icon: Users, label: "Utilisateurs", path: "/admin/utilisateurs" },
  { icon: Mail, label: "Newsletter", path: "/admin/newsletter" },
  { icon: Megaphone, label: "Opportunités", path: "/admin/opportunites" },
  { icon: BookUser, label: "Annuaire", path: "/admin/annuaire" },
  { icon: TrendingUp, label: "Investisseurs", path: "/admin/investisseurs" },
  { icon: Handshake, label: "Partenaires", path: "/admin/partenaires" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: Settings, label: "Paramètres", path: "/admin/parametres" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.005_250)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg"></div>
          <div className="h-4 w-32 bg-primary/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.005_250)]">
        <div className="bg-background border border-border rounded-xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Administration Habari</h1>
          <p className="text-sm text-muted-foreground font-sans mb-8">
            Connectez-vous pour accéder au panneau d'administration.
          </p>
          <a href="/login">
            <Button className="w-full font-sans bg-primary hover:bg-primary/90" size="lg">
              Se connecter
            </Button>
          </a>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.97_0.005_250)]">
        <div className="bg-background border border-border rounded-xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Accès refusé</h1>
          <p className="text-sm text-muted-foreground font-sans mb-8">
            Votre compte n'a pas les droits d'administration nécessaires.
          </p>
          <Link href="/">
            <Button variant="outline" className="font-sans">
              <ChevronLeft className="w-4 h-4 mr-2" /> Retour au site
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.005_250)]">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background border-b border-border min-h-14 flex items-center px-4 justify-between safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-md hover:bg-muted">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <img src="/logo-habari.png" alt="Habari Mag" className="h-8 w-auto" />
          <span className="text-[0.6rem] font-sans text-muted-foreground tracking-wider uppercase">Admin</span>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-sans text-xs">
            <ChevronLeft className="w-3 h-3 mr-1" /> Site
          </Button>
        </Link>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:flex flex-col sticky top-0 h-screen border-r border-border bg-background transition-all duration-300 overflow-hidden ${sidebarOpen ? "w-64" : "w-16"}`}>
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-border justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5">
                <img src="/logo-habari.png" alt="Habari Mag" className="h-10 w-auto shrink-0" />
                <span className="text-[0.55rem] font-sans text-muted-foreground tracking-wider uppercase">Administration</span>
              </div>
            ) : (
              <img src="/logo-habari.png" alt="Habari Mag" className="h-9 w-auto mx-auto" />
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? "Réduire" : "Agrandir"} className="p-1.5 rounded-md hover:bg-muted transition-colors hidden lg:block">
              <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {adminMenuItems.map((item) => {
              const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
              return (
                <Link key={item.path} href={item.path}>
                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  } ${!sidebarOpen ? "justify-center px-0" : ""}`}>
                    <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Back to site + user */}
          <div className="border-t border-border p-3 space-y-2">
            <Link href="/">
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-sans text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${!sidebarOpen ? "justify-center px-0" : ""}`}>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>Retour au site</span>}
              </button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors ${!sidebarOpen ? "justify-center" : ""}`}>
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {user.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate leading-none">{user.name || "Admin"}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">{user.email || ""}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-14 bottom-0 w-64 bg-background border-r border-border z-50 flex flex-col animate-in slide-in-from-left duration-200">
              <nav className="flex-1 py-4 px-2 space-y-1">
                {adminMenuItems.map((item) => {
                  const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
                  return (
                    <Link key={item.path} href={item.path}>
                      <button
                        onClick={() => setMobileOpen(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all ${
                          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        <span>{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-border p-3">
                <Link href="/">
                  <button onClick={() => setMobileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-sans text-muted-foreground hover:bg-muted">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Retour au site</span>
                  </button>
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
