import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Globe, MapPin, Users, Building2, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTORS = ["Agriculture", "Énergie", "Finance", "Technologie", "Santé", "Télécommunications", "Commerce", "Construction", "Logistique", "Industries créatives"];

const sampleActors = [
  { id: 1, name: "BDEAC", sector: "Finance", country: "CEEAC", desc: "Banque de Développement des États de l'Afrique Centrale", employees: "200+", verified: true },
  { id: 2, name: "Afriland First Bank", sector: "Finance", country: "Cameroun", desc: "Groupe bancaire panafricain basé à Yaoundé", employees: "2000+", verified: true },
  { id: 3, name: "Olam Gabon", sector: "Agriculture", country: "Gabon", desc: "Transformation locale de produits agricoles et forestiers", employees: "5000+", verified: true },
  { id: 4, name: "MTN Cameroon", sector: "Télécommunications", country: "Cameroun", desc: "Opérateur de télécommunications leader au Cameroun", employees: "1500+", verified: true },
  { id: 5, name: "Total Energies Congo", sector: "Énergie", country: "Congo", desc: "Exploration et production pétrolière en zone CEEAC", employees: "800+", verified: true },
  { id: 6, name: "CIMENCAM", sector: "Construction", country: "Cameroun", desc: "Cimenteries du Cameroun — leader de la production de ciment", employees: "600+", verified: true },
  { id: 7, name: "Sonangol", sector: "Énergie", country: "Angola", desc: "Société nationale des pétroles d'Angola, acteur majeur du secteur pétrolier africain", employees: "25000+", verified: true },
  { id: 8, name: "Gécamines", sector: "Industries extractives", country: "RDC", desc: "Générale des Carrières et des Mines — exploitation minière en République démocratique du Congo", employees: "10000+", verified: true },
  { id: 9, name: "Bank of Kigali", sector: "Finance", country: "Rwanda", desc: "Première banque commerciale du Rwanda, moteur de l'inclusion financière", employees: "1500+", verified: true },
  { id: 10, name: "Interbank Burundi", sector: "Finance", country: "Burundi", desc: "Banque commerciale de référence au Burundi", employees: "400+", verified: true },
  { id: 11, name: "ENCO", sector: "Agriculture", country: "São Tomé-et-Príncipe", desc: "Entreprise Nationale de Cacao — transformation et export de cacao premium", employees: "300+", verified: true },
];

export default function Directory() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dbActors, isLoading } = trpc.directory.list.useQuery({ limit: 20, offset: 0 });

  const actors = dbActors && dbActors.length > 0 ? dbActors : null;

  const filteredSamples = useMemo(() => {
    let filtered = sampleActors;
    if (selectedSector) filtered = filtered.filter((a) => a.sector === selectedSector);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
    }
    return filtered;
  }, [selectedSector, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Annuaire</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Annuaire économique</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Découvrez et connectez-vous avec les acteurs clés de l'économie de la zone CEEAC.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => setSelectedSector(null)}
                className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${!selectedSector ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Tous les secteurs
              </button>
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSector(s)}
                  className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${selectedSector === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Actors */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : actors ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actors.map((actor) => (
                <Card key={actor.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        {actor.logo ? <img src={actor.logo} alt={actor.name} className="w-full h-full object-cover rounded-lg" /> : <Building2 className="w-6 h-6 text-primary/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-foreground truncate">{actor.name}</h3>
                          {actor.verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-[oklch(0.72_0.15_75)] font-sans font-medium">{actor.sector}</p>
                      </div>
                    </div>
                    {actor.description && <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">{actor.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-sans">
                      {actor.employees && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{actor.employees}</span>}
                      {actor.website && (
                        <a href={actor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          <Globe className="w-3 h-3" />Site web
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSamples.map((actor) => (
                <Card key={actor.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-foreground truncate">{actor.name}</h3>
                          {actor.verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-[oklch(0.72_0.15_75)] font-sans font-medium">{actor.sector}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">{actor.desc}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-sans">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{actor.country}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{actor.employees}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSamples.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-sans">Aucun acteur ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
