import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Menu, X, Shield, Leaf, BarChart3, TreePine, Zap, Landmark, Users, FileText, ChevronDown, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import TrialBanner from "@/components/TrialBanner";

const navLinks = [
  { href: "/magazine", label: "Magazine" },
  { href: "/green", label: "Green", isGreen: true },
  { href: "/annuaire", label: "Annuaire" },
  { href: "/investisseurs", label: "Investisseurs" },
  { href: "/appels-offres", label: "Appels d'offres" },
  { href: "/evenements", label: "Événements" },
  { href: "/archives", label: "Archives" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/abonnements", label: "Votre Accès" },
];

const greenSubLinks = [
  { href: "/green/carbone", label: "Marchés carbone", icon: BarChart3, desc: "Prix crédits, projets REDD+, deals" },
  { href: "/green/forets", label: "Forêts & biodiversité", icon: TreePine, desc: "COMIFAC, aires protégées, certifications" },
  { href: "/green/energie", label: "Transition énergétique", icon: Zap, desc: "Hydroélectricité, solaire, biomasse" },
  { href: "/green/finance", label: "Finance verte", icon: Landmark, desc: "Fonds climat, obligations vertes, ESG" },
  { href: "/green/acteurs", label: "Acteurs verts", icon: Users, desc: "Annuaire développeurs, ONG, consultants" },
  { href: "/green/ressources", label: "Ressources", icon: FileText, desc: "Guides, rapports, outils, réglementation" },
];

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [greenOpen, setGreenOpen] = useState(false);
  const [mobileGreenOpen, setMobileGreenOpen] = useState(false);
  const greenRef = useRef<HTMLDivElement>(null);

  // Close green dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (greenRef.current && !greenRef.current.contains(event.target as Node)) {
        setGreenOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isGreenActive = location.startsWith("/green");

  return (
    <>
      <TrialBanner />
      {/* Top bar */}
      <div className="bg-[oklch(0.20_0.02_250)] text-white/80 text-xs py-1.5 hidden md:block">
        <div className="container flex items-center justify-between">
          <span className="font-sans tracking-wide">Connexion économique pour l'intégration de l'Afrique Centrale. Comprendre, décider, investir, agir.</span>
          <div className="flex items-center gap-4">
            <span>Groupe Sixième Sens</span>
            <span>•</span>
            <span>Trimestriel</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="border-b border-border sticky top-0 bg-background/98 backdrop-blur-sm z-50 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo-habari.png"
              alt="Habari Mag"
              className="h-10 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.isGreen) {
                return (
                  <div key={link.href} ref={greenRef} className="relative">
                    <button
                      onClick={() => setGreenOpen(!greenOpen)}
                      className={`px-3 py-2 text-sm font-sans font-medium transition-colors rounded-md inline-flex items-center gap-1 ${
                        isGreenActive
                          ? "text-[oklch(0.35_0.12_145)] bg-[oklch(0.45_0.15_145)]/5"
                          : "text-[oklch(0.35_0.12_145)] hover:text-[oklch(0.30_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]/5"
                      }`}
                    >
                      <Leaf className="w-3.5 h-3.5" />
                      {link.label}
                      <ChevronDown className={`w-3 h-3 transition-transform ${greenOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Mega menu dropdown */}
                    {greenOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[560px] bg-background border border-border rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                          <Leaf className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
                          <Link href="/green" onClick={() => setGreenOpen(false)} className="font-serif font-bold text-[oklch(0.35_0.12_145)] hover:underline">
                            HABARI GREEN
                          </Link>
                          <span className="text-xs font-sans text-muted-foreground">— Économie verte & développement durable</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {greenSubLinks.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setGreenOpen(false)}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[oklch(0.45_0.15_145)]/5 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-md bg-[oklch(0.45_0.15_145)]/10 flex items-center justify-center shrink-0 mt-0.5">
                                <sub.icon className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
                              </div>
                              <div>
                                <div className="text-sm font-sans font-medium text-foreground group-hover:text-[oklch(0.35_0.12_145)] transition-colors">
                                  {sub.label}
                                </div>
                                <div className="text-xs font-sans text-muted-foreground leading-snug">{sub.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-sans font-medium transition-colors rounded-md ${
                    location === link.href
                      ? "text-primary bg-primary/5"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Search + Auth + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link href="/recherche" className="p-2 rounded-md hover:bg-muted transition-colors text-foreground/60 hover:text-primary" aria-label="Recherche">
              <Search className="w-4.5 h-4.5" />
            </Link>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button size="sm" variant="outline" className="font-sans text-primary border-primary/30 hover:bg-primary/5">
                      <Shield className="w-3.5 h-3.5 mr-1.5" /> Admin
                    </Button>
                  </Link>
                )}
                <Link href="/mon-compte">
                  <Button size="sm" className="font-sans bg-primary hover:bg-primary/90">
                    Mon espace
                  </Button>
                </Link>
              </div>
            ) : (
              <a href="/login" className="hidden sm:block">
                <Button size="sm" className="font-sans bg-primary hover:bg-primary/90">
                  Se connecter
                </Button>
              </a>
            )}

            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background animate-in slide-in-from-top-2 duration-200">
            <div className="container py-4 space-y-1">
              {navLinks.map((link) => {
                if (link.isGreen) {
                  return (
                    <div key={link.href}>
                      <button
                        onClick={() => setMobileGreenOpen(!mobileGreenOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-sans font-medium rounded-md transition-colors ${
                          isGreenActive
                            ? "text-[oklch(0.35_0.12_145)] bg-[oklch(0.45_0.15_145)]/5"
                            : "text-[oklch(0.35_0.12_145)] hover:bg-[oklch(0.45_0.15_145)]/5"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Leaf className="w-3.5 h-3.5" /> {link.label}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileGreenOpen ? "rotate-180" : ""}`} />
                      </button>
                      {mobileGreenOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-[oklch(0.45_0.15_145)]/20 pl-3">
                          <Link
                            href="/green"
                            className="block px-3 py-2 text-sm font-sans font-medium text-[oklch(0.35_0.12_145)] hover:bg-[oklch(0.45_0.15_145)]/5 rounded-md"
                            onClick={() => { setMobileOpen(false); setMobileGreenOpen(false); }}
                          >
                            Vue d'ensemble
                          </Link>
                          {greenSubLinks.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-sans text-foreground/70 hover:text-[oklch(0.35_0.12_145)] hover:bg-[oklch(0.45_0.15_145)]/5 rounded-md"
                              onClick={() => { setMobileOpen(false); setMobileGreenOpen(false); }}
                            >
                              <sub.icon className="w-3.5 h-3.5 text-[oklch(0.45_0.15_145)]" />
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 text-sm font-sans font-medium rounded-md transition-colors ${
                      location === link.href
                        ? "text-primary bg-primary/5"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/recherche"
                className="flex items-center gap-2 px-4 py-3 text-sm font-sans font-medium rounded-md text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <Search className="w-4 h-4" /> Recherche avancée
              </Link>
              <div className="pt-3 border-t border-border mt-3 space-y-2">
                {isAuthenticated ? (
                  <>
                    {user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full font-sans text-primary border-primary/30">
                          <Shield className="w-3.5 h-3.5 mr-1.5" /> Administration
                        </Button>
                      </Link>
                    )}
                    <Link href="/mon-compte" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full font-sans bg-primary">Mon espace</Button>
                    </Link>
                  </>
                ) : (
                  <a href="/login">
                    <Button className="w-full font-sans bg-primary">Se connecter</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
