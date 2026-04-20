import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Globe, Users, Building2, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTORS = ["Agriculture", "Énergie", "Finance", "Technologie", "Santé", "Télécommunications", "Commerce", "Construction", "Logistique", "Industries créatives"];
const LIMIT = 12;

export default function Directory() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { isFetching, data: pageData, isLoading } = trpc.directory.list.useQuery({ limit: LIMIT, offset });

  useEffect(() => {
    if (!pageData) return;
    if (offset === 0) {
      setAllItems(pageData);
    } else {
      setAllItems((prev) => [...prev, ...pageData]);
    }
    setHasMore(pageData.length === LIMIT);
  }, [pageData, offset]);

  const handleSectorChange = (sector: string | null) => {
    setSelectedSector(sector);
    setOffset(0);
    setAllItems([]);
    setHasMore(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setOffset(0);
    setAllItems([]);
    setHasMore(true);
  };

  const handleLoadMore = () => setOffset((prev) => prev + LIMIT);

  const actors = useMemo(() => {
    let list = allItems;
    if (selectedSector) list = list.filter((a: any) => a.sector === selectedSector);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a: any) =>
        a.name?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allItems, selectedSector, searchQuery]);

  const isInitialLoading = isLoading && offset === 0 && allItems.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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

      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => handleSectorChange(null)}
                className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${!selectedSector ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Tous les secteurs
              </button>
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSectorChange(s)}
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isInitialLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : actors.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">
                {allItems.length === 0
                  ? "L'annuaire sera bientôt disponible."
                  : "Aucun acteur ne correspond à votre recherche."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actors.map((actor: any) => (
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
                          {actor.sector && <p className="text-sm text-[oklch(0.72_0.15_75)] font-sans font-medium">{actor.sector}</p>}
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
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <Button variant="outline" onClick={handleLoadMore} disabled={isFetching} className="font-sans px-8">
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Voir plus
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
