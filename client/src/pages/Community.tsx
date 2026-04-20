import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Briefcase, MapPin, MessageCircle, UserPlus, Globe, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

const CATEGORIES = ["Entrepreneurs", "Investisseurs", "Décideurs", "Consultants", "Startups", "ONG & Institutions"];

const COUNTRY_FLAGS: Record<string, string> = {
  "RDC": "🇨🇩",
  "Cameroun": "🇨🇲",
  "Gabon": "🇬🇦",
  "Congo": "🇨🇬",
  "RCA": "🇨🇫",
  "Tchad": "🇹🇩",
  "Guinée Équatoriale": "🇬🇶",
  "Burundi": "🇧🇮",
  "Rwanda": "🇷🇼",
  "Angola": "🇦🇴",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: members = [], isLoading } = trpc.community.list.useQuery({ limit: 100, offset: 0 });

  const filtered = useMemo(() => {
    let list = members;
    if (selectedCategory) list = list.filter((m: any) => m.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m: any) =>
        m.name?.toLowerCase().includes(q) ||
        m.company?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.country?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Communauté</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Communauté Habari</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Réseau professionnel des entrepreneurs, investisseurs et décideurs d'Afrique Centrale.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-serif">{members.length > 0 ? `${members.length}+` : "2 400+"}</div>
              <div className="text-sm text-white/50 font-sans">Membres</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-serif">10</div>
              <div className="text-sm text-white/50 font-sans">Pays CEEAC</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-serif">15+</div>
              <div className="text-sm text-white/50 font-sans">Secteurs</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${!selectedCategory ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Tous les membres
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${selectedCategory === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">
                {members.length === 0
                  ? "La communauté sera bientôt disponible."
                  : "Aucun membre ne correspond à votre recherche."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((member: any) => (
                <Card key={member.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-serif font-bold text-primary text-lg overflow-hidden">
                        {member.avatar
                          ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          : getInitials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-foreground truncate">{member.name}</h3>
                          {member.verified && (
                            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                        {member.role && <p className="text-sm text-[oklch(0.72_0.15_75)] font-sans font-medium truncate">{member.role}</p>}
                        {member.company && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-sans truncate">{member.company}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {member.bio && <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">{member.bio}</p>}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
                        {member.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {COUNTRY_FLAGS[member.country] || "🌍"} {member.country}
                          </span>
                        )}
                      </div>
                      {member.category && (
                        <span className="px-2 py-0.5 bg-muted rounded text-xs font-sans text-muted-foreground">{member.category}</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.linkedin && (
                        <Button size="sm" variant="outline" className="flex-1 font-sans text-xs h-8 gap-1" asChild>
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                            <UserPlus className="w-3 h-3" />LinkedIn
                          </a>
                        </Button>
                      )}
                      {member.email && (
                        <Button size="sm" variant="outline" className="flex-1 font-sans text-xs h-8 gap-1" asChild>
                          <a href={`mailto:${member.email}`}>
                            <MessageCircle className="w-3 h-3" />Message
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 bg-muted/40 rounded-2xl p-8 text-center border border-border">
            <Globe className="w-10 h-10 text-primary/40 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Rejoindre la communauté</h2>
            <p className="text-muted-foreground font-sans max-w-lg mx-auto mb-6">
              Accédez au réseau complet des professionnels de la zone CEEAC. Partagez vos opportunités, trouvez des partenaires, développez votre activité.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="font-sans px-8" asChild>
                <a href="/inscription">Créer un compte gratuit</a>
              </Button>
              <Button variant="outline" className="font-sans px-8" asChild>
                <a href="/abonnements">Accès Premium</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
