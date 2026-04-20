import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Calendar, MapPin, X, Users, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const types = ["Tous", "conference", "webinar", "training", "workshop", "networking"];
const typeLabels: Record<string, string> = { conference: "Conférence", webinar: "Webinaire", training: "Formation", workshop: "Atelier", networking: "Networking" };

export default function Events() {
  const [activeType, setActiveType] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dbEvents, isLoading } = trpc.events.upcoming.useQuery({ limit: 20 });
  type EventItem = NonNullable<typeof dbEvents>[number];
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const filteredEvents = useMemo(() => {
    let filtered = dbEvents ?? [];
    if (activeType !== "Tous") filtered = filtered.filter((e) => e.type === activeType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(q) || (e.description ?? "").toLowerCase().includes(q));
    }
    return filtered;
  }, [dbEvents, activeType, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Agenda</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Événements &amp; Formations</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Conférences, formations, webinaires et rencontres professionnelles dédiés à l'économie de la zone CEEAC.
          </p>
        </div>
      </section>

      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              {types.map((t) => (
                <button key={t} onClick={() => setActiveType(t)} className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${activeType === t ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {t === "Tous" ? "Tous" : typeLabels[t] || t}
                </button>
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
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">
                {searchQuery.trim() || activeType !== "Tous" ? "Aucun événement ne correspond à votre recherche." : "Aucun événement à venir pour le moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => (
                <Card key={ev.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-center bg-primary/5 rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-serif font-bold text-primary">{ev.startDate && new Date(ev.startDate).getDate()}</div>
                        <div className="text-xs text-muted-foreground font-sans uppercase">{ev.startDate && new Date(ev.startDate).toLocaleDateString('fr-FR', { month: 'short' })}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="inline-block text-xs font-sans px-2 py-0.5 bg-[oklch(0.72_0.15_75)]/10 text-[oklch(0.55_0.12_75)] rounded capitalize">{typeLabels[ev.type] || ev.type}</span>
                          {(ev as any).isExclusive && (
                            <span className="inline-block text-xs font-sans font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">Intégral</span>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-foreground leading-snug">{ev.title}</h3>
                      </div>
                    </div>
                    {ev.description && <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">{ev.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
                        {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                      </div>
                      <Button size="sm" variant="outline" className="font-sans text-xs" onClick={() => setSelectedEvent(ev)}>
                        Voir plus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Event detail modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl leading-snug">{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              {(selectedEvent as any).image && (
                <img src={(selectedEvent as any).image} alt={selectedEvent.title} className="w-full h-48 object-cover rounded-lg" />
              )}
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-sans px-2 py-0.5 bg-habari-gold/10 text-[oklch(0.55_0.12_75)] rounded capitalize">
                    {typeLabels[selectedEvent.type] || selectedEvent.type}
                  </span>
                  {(selectedEvent as any).isExclusive && (
                    <span className="text-xs font-sans font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">Intégral</span>
                  )}
                  {selectedEvent.status && (
                    <span className="text-xs font-sans px-2 py-0.5 bg-muted text-muted-foreground rounded capitalize">{selectedEvent.status}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-sans text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      {new Date(selectedEvent.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {(selectedEvent as any).endDate && (
                        <> → {new Date((selectedEvent as any).endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                      )}
                    </span>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {(selectedEvent as any).capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Capacité : {(selectedEvent as any).capacity} participants</span>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div>
                    <p className="text-sm font-sans text-foreground leading-relaxed whitespace-pre-line">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
