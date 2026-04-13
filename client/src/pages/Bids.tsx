import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, FileText, Calendar, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sampleBids = [
  { id: 1, title: "Construction d'un pont sur la Sanaga", org: "Ministère des Travaux Publics", country: "Cameroun", deadline: "15 mars 2026", sector: "Infrastructure", budget: "12M USD" },
  { id: 2, title: "Fourniture d'équipements médicaux — CHU Libreville", org: "Ministère de la Santé", country: "Gabon", deadline: "28 février 2026", sector: "Santé", budget: "3.5M USD" },
  { id: 3, title: "Électrification rurale — Phase 2", org: "ENEO", country: "Cameroun", deadline: "10 avril 2026", sector: "Énergie", budget: "8M USD" },
  { id: 4, title: "Réhabilitation du port autonome de Pointe-Noire", org: "Port Autonome de Pointe-Noire", country: "Congo", deadline: "30 mars 2026", sector: "Infrastructure", budget: "25M USD" },
  { id: 5, title: "Système d'information foncière numérique", org: "Ministère des Domaines", country: "Gabon", deadline: "20 mars 2026", sector: "Technologie", budget: "2M USD" },
  { id: 6, title: "Approvisionnement en intrants agricoles", org: "MINADER", country: "Cameroun", deadline: "5 avril 2026", sector: "Agriculture", budget: "5M USD" },
  { id: 7, title: "Construction d'un barrage hydroélectrique — Calandula", org: "Ministère de l'Énergie", country: "Angola", deadline: "15 mai 2026", sector: "Énergie", budget: "120M USD" },
  { id: 8, title: "Réhabilitation de la RN1 — Kinshasa-Matadi", org: "Office des Routes", country: "RDC", deadline: "30 avril 2026", sector: "Infrastructure", budget: "45M USD" },
  { id: 9, title: "Kigali Smart City — Infrastructure numérique", org: "Rwanda ICT Chamber", country: "Rwanda", deadline: "20 mai 2026", sector: "Technologie", budget: "8M USD" },
  { id: 10, title: "Rénovation du réseau d'eau potable — Bujumbura", org: "REGIDESO", country: "Burundi", deadline: "10 juin 2026", sector: "Infrastructure", budget: "6M USD" },
  { id: 11, title: "Modernisation du port de Névès", org: "ENAPORT", country: "São Tomé-et-Príncipe", deadline: "25 mai 2026", sector: "Infrastructure", budget: "3M USD" },
];

const sectorsList = ["Tous", "Infrastructure", "Santé", "Énergie", "Technologie", "Agriculture"];

export default function Bids() {
  const [activeSector, setActiveSector] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dbBids, isLoading } = trpc.bids.list.useQuery({ limit: 20, offset: 0 });

  const bids = dbBids && dbBids.length > 0 ? dbBids : null;

  const filteredSamples = useMemo(() => {
    let filtered = sampleBids;
    if (activeSector !== "Tous") filtered = filtered.filter((b) => b.sector === activeSector);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((b) => b.title.toLowerCase().includes(q) || b.org.toLowerCase().includes(q));
    }
    return filtered;
  }, [activeSector, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Marchés publics</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Appels d'offres</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Consultez les dernières opportunités commerciales et appels d'offres dans la zone CEEAC.
          </p>
        </div>
      </section>

      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              {sectorsList.map((s) => (
                <button key={s} onClick={() => setActiveSector(s)} className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${activeSector === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{s}</button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : bids ? (
            <div className="space-y-4">
              {bids.map((bid) => (
                <Card key={bid.id} className="border shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="habari-rubrique text-xs">{bid.sector}</span>
                          <span className={`text-xs font-sans px-2 py-0.5 rounded capitalize ${bid.status === "open" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{bid.status === "open" ? "Ouvert" : "Fermé"}</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-foreground mb-1">{bid.title}</h3>
                        <p className="text-sm text-muted-foreground font-sans">Réf. #{bid.id}</p>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2 text-sm font-sans">
                        {bid.deadline && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Limite : {new Date(bid.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                        )}
                        {bid.budget && <div className="text-lg font-bold text-[oklch(0.72_0.15_75)]">{bid.budget} {bid.currency}</div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSamples.map((bid) => (
                <Card key={bid.id} className="border shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="habari-rubrique text-xs">{bid.sector}</span>
                          <span className="text-xs font-sans px-2 py-0.5 bg-green-50 text-green-700 rounded">Ouvert</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-foreground mb-1">{bid.title}</h3>
                        <p className="text-sm text-muted-foreground font-sans">{bid.org}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" /><span>{bid.country}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2 text-sm font-sans">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" /><span>Limite : {bid.deadline}</span>
                        </div>
                        <div className="text-lg font-bold text-[oklch(0.72_0.15_75)]">{bid.budget}</div>
                        <Button variant="ghost" size="sm" className="font-sans text-primary gap-1 p-0 h-auto">
                          Voir les détails <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSamples.length === 0 && (
                <div className="text-center py-20">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-sans">Aucun appel d'offres ne correspond à votre recherche.</p>
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
