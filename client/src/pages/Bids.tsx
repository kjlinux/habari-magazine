import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Search,
  FileText,
  Calendar,
  MapPin,
  ArrowRight,
  Briefcase,
  Users,
  Handshake,
  ExternalLink,
  Sun,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type AnyItem = {
  id: number; title: string; organization: string; country: string;
  sector?: string | null; description?: string | null; deadline?: string | null; budget?: string | null;
  currency?: string | null; externalLink?: string | null; featured?: boolean | null;
  amiType?: string | null; partners?: string | null; webinaire?: string | null;
  contractType?: string | null; experienceLevel?: string | null;
  type: "bid" | "ami" | "job";
};

function DetailModal({ item, onClose }: { item: AnyItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {item.sector && <span className="habari-rubrique text-xs">{item.sector}</span>}
              {item.amiType && <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-sans">{item.amiType}</span>}
              {item.contractType && <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-sans">{item.contractType}</span>}
              {item.experienceLevel && <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded font-sans">{item.experienceLevel}</span>}
            </div>
            <h2 className="font-serif font-bold text-xl text-foreground">{item.title}</h2>
            <p className="text-sm text-muted-foreground font-sans mt-1">{item.organization}</p>
          </div>
          <button type="button" aria-label="Fermer" onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 text-sm font-sans text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{item.country}</span>
            {item.deadline && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Limite : {item.deadline}</span>}
            {item.budget && <span className="font-bold text-[oklch(0.72_0.15_75)]">{item.budget} {item.currency}</span>}
          </div>
          {item.description && <p className="text-sm font-sans text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.description}</p>}
          {item.partners && (
            <div className="flex items-center gap-1.5 text-sm font-sans text-muted-foreground">
              <Users className="w-3.5 h-3.5" /><span>Partenaires : {item.partners}</span>
            </div>
          )}
          {item.webinaire && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-sans font-semibold text-blue-800 mb-1">Webinaire d'information</p>
              <p className="text-xs font-sans text-blue-700">{item.webinaire}</p>
            </div>
          )}
          {item.externalLink && (
            <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
              <Button className="font-sans bg-primary hover:bg-primary/90 mt-2">
                <ExternalLink className="w-4 h-4 mr-2" />
                {item.type === "job" ? "Postuler" : "Accéder au dossier complet"}
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Onglets principaux ── */
type TabKey = "offres" | "ami" | "emplois";

const tabs: { key: TabKey; label: string; icon: any }[] = [
  { key: "offres", label: "Appels d'offres", icon: FileText },
  { key: "ami", label: "AMI / Partenariats", icon: Handshake },
  { key: "emplois", label: "Emplois & Stages", icon: Briefcase },
];

const sectorsList = [
  "Tous",
  "Infrastructure",
  "Santé",
  "Énergie",
  "Technologie",
  "Agriculture",
  "Environnement",
];

export default function Bids() {
  const [activeTab, setActiveTab] = useState<TabKey>("offres");
  const [activeSector, setActiveSector] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<AnyItem | null>(null);

  const { data: dbBids, isLoading: loadingBids } =
    trpc.opportunities.list.useQuery({ type: "bid" });
  const { data: dbAMI, isLoading: loadingAMI } =
    trpc.opportunities.list.useQuery({ type: "ami" });
  const { data: dbJobs, isLoading: loadingJobs } =
    trpc.opportunities.list.useQuery({ type: "job" });

  const bidsData = (dbBids ?? []).map(i => ({
    ...i,
    deadline: i.deadline ?? "",
    sector: i.sector ?? "",
    budget: i.budget ?? "",
    currency: i.currency ?? "USD",
    description: i.description ?? "",
    externalLink: i.externalLink ?? "",
    featured: i.featured ?? false,
    type: "bid" as const,
  }));

  const amiData = (dbAMI ?? []).map(i => ({
    ...i,
    deadline: i.deadline ?? "",
    sector: i.sector ?? "",
    description: i.description ?? "",
    externalLink: i.externalLink ?? "",
    amiType: i.amiType ?? "",
    partners: i.partners ?? "",
    webinaire: i.webinaire ?? "",
    featured: i.featured ?? false,
    type: "ami" as const,
  }));

  const jobsData = (dbJobs ?? []).map(i => ({
    ...i,
    deadline: i.deadline ?? "",
    description: i.description ?? "",
    externalLink: i.externalLink ?? "",
    contractType: i.contractType ?? "",
    experienceLevel: i.experienceLevel ?? "",
    featured: i.featured ?? false,
    type: "job" as const,
  }));

  const isLoading =
    activeTab === "offres"
      ? loadingBids
      : activeTab === "ami"
        ? loadingAMI
        : loadingJobs;

  const filteredBids = useMemo(() => {
    let filtered = bidsData;
    if (activeSector !== "Tous")
      filtered = filtered.filter(b => b.sector === activeSector);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.organization.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [bidsData, activeSector, searchQuery]);

  const filteredAMI = useMemo(() => {
    let filtered = amiData;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.organization.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [amiData, searchQuery]);

  const filteredJobs = useMemo(() => {
    let filtered = jobsData;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.organization.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [jobsData, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">
            Opportunités
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Appels d'offres, AMI et Emplois
          </h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Consultez les dernières opportunités commerciales, appels à
            manifestation d'intérêt, partenariats et offres d'emploi dans la
            zone CEEAC.
          </p>
        </div>
      </section>

      {/* Onglets principaux */}
      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container">
          <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setActiveSector("Tous");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-sans font-medium rounded-md transition-all ${
                    activeTab === tab.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {activeTab === "offres" && (
                <div className="flex flex-wrap gap-2 flex-1">
                  {sectorsList.map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSector(s)}
                      className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${activeSector === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {activeTab !== "offres" && <div className="flex-1" />}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
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
          ) : activeTab === "offres" ? (
            <div className="space-y-4">
              {filteredBids.map(bid => (
                <Card
                  key={bid.id}
                  className={`border shadow-sm hover:shadow-md transition-all duration-300 ${bid.featured ? "border-[oklch(0.72_0.15_75)] ring-1 ring-[oklch(0.72_0.15_75)]/20" : ""}`}
                >
                  <CardContent className="p-6">
                    {bid.featured && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[oklch(0.72_0.15_75)]/20">
                        <Sun className="w-4 h-4 text-[oklch(0.72_0.15_75)]" />
                        <span className="text-xs font-sans font-bold text-[oklch(0.72_0.15_75)] uppercase tracking-wider">
                          À la une
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {bid.sector && (
                            <span className="habari-rubrique text-xs">
                              {bid.sector}
                            </span>
                          )}
                          <span className="text-xs font-sans px-2 py-0.5 bg-green-50 text-green-700 rounded">
                            Ouvert
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                          {bid.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {bid.organization}
                        </p>
                        {bid.description && (
                          <p className="text-sm text-muted-foreground font-sans mt-2 leading-relaxed">
                            {bid.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{bid.country}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2 text-sm font-sans">
                        {bid.deadline && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Limite : {bid.deadline}</span>
                          </div>
                        )}
                        {bid.budget && (
                          <div className="text-lg font-bold text-[oklch(0.72_0.15_75)]">
                            {bid.budget} {bid.currency}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(bid)}
                          className="font-sans text-primary gap-1 p-0 h-auto"
                        >
                          Voir les détails <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredBids.length === 0 && (
                <div className="text-center py-20">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-sans">
                    Aucun appel d'offres ne correspond à votre recherche.
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "ami" ? (
            <div className="space-y-4">
              {filteredAMI.map(item => (
                <Card
                  key={item.id}
                  className={`border shadow-sm hover:shadow-md transition-all duration-300 ${item.featured ? "border-[oklch(0.72_0.15_75)] ring-1 ring-[oklch(0.72_0.15_75)]/20" : ""}`}
                >
                  <CardContent className="p-6">
                    {item.featured && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[oklch(0.72_0.15_75)]/20">
                        <Sun className="w-4 h-4 text-[oklch(0.72_0.15_75)]" />
                        <span className="text-xs font-sans font-bold text-[oklch(0.72_0.15_75)] uppercase tracking-wider">
                          Nouveau — À la une
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {item.sector && (
                            <span className="habari-rubrique text-xs">
                              {item.sector}
                            </span>
                          )}
                          {"amiType" in item && item.amiType && (
                            <span className="text-xs font-sans px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                              {item.amiType}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {item.organization}
                        </p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground font-sans mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{item.country}</span>
                        </div>
                        {"partners" in item && item.partners && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>Partenaires : {item.partners}</span>
                          </div>
                        )}
                        {"webinaire" in item && item.webinaire && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-sans font-semibold text-blue-800 mb-1">
                              Webinaire d'information
                            </p>
                            <p className="text-xs font-sans text-blue-700">
                              {item.webinaire}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2 text-sm font-sans">
                        {item.deadline && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Limite : {item.deadline}</span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                          className="font-sans text-primary gap-1 p-0 h-auto"
                        >
                          Voir les détails <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredAMI.length === 0 && (
                <div className="text-center py-20">
                  <Handshake className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-sans">
                    Aucun AMI ne correspond à votre recherche.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <Card
                  key={job.id}
                  className={`border shadow-sm hover:shadow-md transition-all duration-300 ${job.featured ? "border-[oklch(0.72_0.15_75)] ring-1 ring-[oklch(0.72_0.15_75)]/20" : ""}`}
                >
                  <CardContent className="p-6">
                    {job.featured && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[oklch(0.72_0.15_75)]/20">
                        <Sun className="w-4 h-4 text-[oklch(0.72_0.15_75)]" />
                        <span className="text-xs font-sans font-bold text-[oklch(0.72_0.15_75)] uppercase tracking-wider">
                          À la une
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {"contractType" in job && job.contractType && (
                            <span className="text-xs font-sans px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">
                              {job.contractType}
                            </span>
                          )}
                          {"experienceLevel" in job && job.experienceLevel && (
                            <span className="text-xs font-sans px-2 py-0.5 bg-muted text-muted-foreground rounded">
                              {job.experienceLevel}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-bold text-lg text-foreground mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {job.organization}
                        </p>
                        {job.description && (
                          <p className="text-sm text-muted-foreground font-sans mt-2 leading-relaxed">
                            {job.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{job.country}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2 text-sm font-sans">
                        {job.deadline && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Limite : {job.deadline}</span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(job)}
                          className="font-sans text-primary gap-1 p-0 h-auto"
                        >
                          Voir les détails <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredJobs.length === 0 && (
                <div className="text-center py-20">
                  <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-sans">
                    Aucune offre d'emploi ne correspond à votre recherche.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

      <Footer />
    </div>
  );
}
