import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Calendar, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sampleEvents = [
  { id: 1, title: "PME-Bright Forum — Douala 2026", type: "conference", date: "15 mars 2026", location: "Douala, Cameroun", desc: "Le rendez-vous annuel des PME de la zone CEEAC. Networking, ateliers et conférences." },
  { id: 2, title: "Petit-déjeuner décideurs CEEAC", type: "networking", date: "22 avril 2026", location: "Libreville, Gabon", desc: "Rencontre exclusive entre décideurs économiques et institutionnels de la zone CEEAC." },
  { id: 3, title: "Habari Awards — Édition inaugurale", type: "conference", date: "10 mai 2026", location: "Yaoundé, Cameroun", desc: "Cérémonie de remise des prix récompensant l'excellence entrepreneuriale en zone CEEAC." },
  { id: 4, title: "Formation : Levée de fonds en Afrique", type: "formation", date: "5 juin 2026", location: "En ligne", desc: "Masterclass de 3 jours sur les stratégies de levée de fonds pour les startups africaines." },
  { id: 5, title: "Webinaire : Réforme fiscale CEEAC", type: "webinaire", date: "18 mars 2026", location: "En ligne", desc: "Analyse des nouvelles dispositions fiscales et leur impact sur les entreprises de la zone." },
  { id: 6, title: "Salon de l'Agriculture de la zone CEEAC", type: "conference", date: "20 juillet 2026", location: "Brazzaville, Congo", desc: "Exposition et conférences sur l'agro-industrie et la sécurité alimentaire régionale." },
  { id: 7, title: "Angola Oil & Gas Summit 2026", type: "conference", date: "12 septembre 2026", location: "Luanda, Angola", desc: "Sommet international sur l'énergie et les hydrocarbures en Afrique Centrale. Investisseurs et opérateurs réunis." },
  { id: 8, title: "DRC Mining Week", type: "conference", date: "8 octobre 2026", location: "Lubumbashi, RDC", desc: "Salon minier de référence en République démocratique du Congo. Cobalt, cuivre et minéraux stratégiques." },
  { id: 9, title: "Kigali FinTech Summit", type: "conference", date: "25 juin 2026", location: "Kigali, Rwanda", desc: "Sommet dédié à l'innovation financière et à l'inclusion numérique en Afrique de l'Est et Centrale." },
  { id: 10, title: "Forum café & cacao — Grands Lacs", type: "networking", date: "14 août 2026", location: "Bujumbura, Burundi", desc: "Rencontre entre producteurs, exportateurs et acheteurs internationaux de café et cacao." },
  { id: 11, title: "PME-Bright Forum — N'Djamena 2026", type: "conference", date: "15 novembre 2026", location: "N'Djamena, Tchad", desc: "Forum dédié aux PME et à l'entrepreneuriat en zone CEEAC. Ateliers, pitchs et rencontres B2B pour accélérer la croissance des entreprises tchadiennes et régionales." },
  { id: 12, title: "Cultur'Com — Ouagadougou 2026", type: "conference", date: "26 février 2026", location: "Ouagadougou, Burkina Faso", desc: "Rendez-vous des industries culturelles et créatives d'Afrique. Échanges sur la communication, les médias et la culture comme leviers de développement économique." },
  { id: 13, title: "Petit-déjeuner décideurs CEEAC — Kinshasa", type: "networking", date: "2026", location: "Kinshasa, RDC", desc: "Rencontre exclusive entre décideurs économiques, institutionnels et investisseurs de la zone CEEAC. Échanges stratégiques sur les opportunités en République démocratique du Congo." },
  { id: 14, title: "Sommet de la Ligue des États Arabes (Sommet Ordinaire)", type: "sommet", date: "Fin mars 2026", location: "Alger, Algérie", desc: "Sommet ordinaire de la Ligue des États Arabes. Lieu sous réserve de confirmation officielle. Enjeux géopolitiques et économiques pour la coopération arabo-africaine." },
  { id: 15, title: "Réunion Ministérielle du G20 — Finances", type: "sommet", date: "Mars 2026", location: "États-Unis", desc: "Première grande réunion technique pour préparer le sommet des dirigeants de Miami (décembre 2026). Sous la présidence américaine du G20, enjeux de stabilité financière mondiale." },
  { id: 16, title: "Sommet ASEAN–Australie (Sommet Spécial)", type: "sommet", date: "Mars 2026", location: "À confirmer", desc: "Renforcement des liens sécuritaires et commerciaux en Indo-Pacifique. Sommet spécial entre l'ASEAN et l'Australie, avec des implications pour les partenariats africains." },
  { id: 17, title: "OMC MC14 — 14ᵉ Conférence ministérielle", type: "sommet", date: "26-29 mars 2026", location: "Yaoundé, Cameroun", desc: "Événement historique pour la CEEAC : la 14ᵉ Conférence ministérielle de l'OMC se tient pour la première fois en Afrique Centrale. Renforce le commerce régional avec le tarif externe commun CEEAC appliqué dès janvier 2026." },
  { id: 18, title: "Sommet Afrique-France \"Africa Forward\"", type: "sommet", date: "11-12 mai 2026", location: "Nairobi, Kenya", desc: "Premier sommet du genre en pays anglophone. La France invite tous les chefs d'État africains, y compris ceux de la zone CEEAC, pour parler innovation et climat. Un tournant dans les relations franco-africaines." },
  { id: 19, title: "Trade and Sustainability Hub (en marge OMC MC14)", type: "sommet", date: "Mars 2026", location: "Yaoundé, Cameroun", desc: "Pour la première fois en Afrique Centrale, les ministres du monde entier discuteront des échanges de biens et services environnementaux. Un enjeu majeur pour l'économie verte de la zone CEEAC." },
];

const types = ["Tous", "sommet", "conference", "networking", "formation", "webinaire"];
const typeLabels: Record<string, string> = { sommet: "Sommet", conference: "Conférence", networking: "Networking", formation: "Formation", webinaire: "Webinaire" };

export default function Events() {
  const [activeType, setActiveType] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dbEvents, isLoading } = trpc.events.upcoming.useQuery({ limit: 20 });

  const events = dbEvents && dbEvents.length > 0 ? dbEvents : null;

  const filteredSamples = useMemo(() => {
    let filtered = sampleEvents;
    if (activeType !== "Tous") filtered = filtered.filter((e) => e.type === activeType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q));
    }
    return filtered;
  }, [activeType, searchQuery]);

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
          ) : events ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <Card key={ev.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-center bg-primary/5 rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-serif font-bold text-primary">{ev.startDate && new Date(ev.startDate).getDate()}</div>
                        <div className="text-xs text-muted-foreground font-sans uppercase">{ev.startDate && new Date(ev.startDate).toLocaleDateString('fr-FR', { month: 'short' })}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="inline-block text-xs font-sans px-2 py-0.5 bg-[oklch(0.72_0.15_75)]/10 text-[oklch(0.55_0.12_75)] rounded capitalize">{ev.type}</span>
                          {(ev as any).isExclusive && (
                            <span className="inline-block text-xs font-sans font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">Intégral</span>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-foreground leading-snug">{ev.title}</h3>
                      </div>
                    </div>
                    {ev.description && <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">{ev.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-sans">
                      {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSamples.map((ev) => (
                <Card key={ev.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-center bg-primary/5 rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-serif font-bold text-primary">{ev.date.split(" ")[0]}</div>
                        <div className="text-xs text-muted-foreground font-sans uppercase">{ev.date.split(" ")[1]}</div>
                      </div>
                      <div className="flex-1">
                        <span className="inline-block mb-2 text-xs font-sans px-2 py-0.5 bg-[oklch(0.72_0.15_75)]/10 text-[oklch(0.55_0.12_75)] rounded capitalize">{typeLabels[ev.type] || ev.type}</span>
                        <h3 className="font-serif font-bold text-foreground leading-snug">{ev.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-3">{ev.desc}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-sans">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSamples.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-sans">Aucun événement ne correspond à votre recherche.</p>
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
