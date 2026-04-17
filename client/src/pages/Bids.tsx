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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Onglets principaux ── */
type TabKey = "offres" | "ami" | "emplois";

const tabs: { key: TabKey; label: string; icon: any }[] = [
  { key: "offres", label: "Appels d'offres", icon: FileText },
  { key: "ami", label: "AMI / Partenariats", icon: Handshake },
  { key: "emplois", label: "Emplois & Stages", icon: Briefcase },
];

/* ── Données exemples (fallback si DB vide) ── */
const sampleBids = [
  {
    id: 1,
    title: "Construction d'un pont sur la Sanaga",
    organization: "Ministère des Travaux Publics",
    country: "Cameroun",
    deadline: "15 mars 2026",
    sector: "Infrastructure",
    budget: "12M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 2,
    title: "Fourniture d'équipements médicaux — CHU Libreville",
    organization: "Ministère de la Santé",
    country: "Gabon",
    deadline: "28 février 2026",
    sector: "Santé",
    budget: "3.5M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 3,
    title: "Électrification rurale — Phase 2",
    organization: "ENEO",
    country: "Cameroun",
    deadline: "10 avril 2026",
    sector: "Énergie",
    budget: "8M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 4,
    title: "Réhabilitation du port autonome de Pointe-Noire",
    organization: "Port Autonome de Pointe-Noire",
    country: "Congo",
    deadline: "30 mars 2026",
    sector: "Infrastructure",
    budget: "25M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 5,
    title: "Système d'information foncière numérique",
    organization: "Ministère des Domaines",
    country: "Gabon",
    deadline: "20 mars 2026",
    sector: "Technologie",
    budget: "2M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 6,
    title: "Approvisionnement en intrants agricoles",
    organization: "MINADER",
    country: "Cameroun",
    deadline: "5 avril 2026",
    sector: "Agriculture",
    budget: "5M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 7,
    title: "Construction d'un barrage hydroélectrique — Calandula",
    organization: "Ministère de l'Énergie",
    country: "Angola",
    deadline: "15 mai 2026",
    sector: "Énergie",
    budget: "120M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 8,
    title: "Réhabilitation de la RN1 — Kinshasa-Matadi",
    organization: "Office des Routes",
    country: "RDC",
    deadline: "30 avril 2026",
    sector: "Infrastructure",
    budget: "45M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 9,
    title: "Kigali Smart City — Infrastructure numérique",
    organization: "Rwanda ICT Chamber",
    country: "Rwanda",
    deadline: "20 mai 2026",
    sector: "Technologie",
    budget: "8M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 10,
    title: "Rénovation du réseau d'eau potable — Bujumbura",
    organization: "REGIDESO",
    country: "Burundi",
    deadline: "10 juin 2026",
    sector: "Infrastructure",
    budget: "6M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
  {
    id: 11,
    title: "Modernisation du port de Névès",
    organization: "ENAPORT",
    country: "São Tomé-et-Príncipe",
    deadline: "25 mai 2026",
    sector: "Infrastructure",
    budget: "3M",
    currency: "USD",
    featured: false,
    status: "active",
    externalLink: "",
    description: "",
    type: "bid" as const,
  },
];

const sampleAMI = [
  {
    id: 107,
    title:
      "Appel à candidatures — Promotion des équipements de cuisson artisanaux (G4-A1)",
    organization: "Arzikin HASKE",
    country: "Niger",
    deadline: "10 avril 2026",
    sector: "Énergie",
    amiType: "Appel à candidatures",
    featured: true,
    description:
      "Renforcer la chaîne de valeur locale des équipements de cuisson propre et efficace (CPE) au Niger. S'adresse aux artisans, coopératives et micro-entreprises produisant des foyers améliorés. Budget : USD 500 000 (25 000 à 50 000 par bénéficiaire). Objectif : faciliter l'accès à des solutions de cuisson de qualité pour 550 000 ménages nigériens.",
    partners: "Projet HASKE",
    webinaire: "",
    externalLink: "https://arzikinhaske.com/appel-a-candidature-g4-a1/",
    type: "ami" as const,
    status: "active",
  },
  {
    id: 106,
    title:
      "Appel à Projets — Fonds Mwinda : Financement Basé sur les Résultats (FBR) pour Systèmes Solaires Domestiques (SHS)",
    organization: "ANSER RDC (Fonds Mwinda)",
    country: "RDC",
    deadline: "27 mars 2026",
    sector: "Énergie",
    amiType: "Appel à projets",
    featured: true,
    description:
      "Le Fonds Mwinda lance un appel à projets destiné aux entreprises locales et internationales qui déploient des systèmes solaires domestiques (SHS) en République Démocratique du Congo. Initiative visant à accélérer l'accès à l'électricité pour les populations non desservies.",
    partners: "GEAPP, GreenMax Capital Group, Banque Mondiale",
    webinaire: "17 mars 2026 — 10h30-12h30 (UTC+1, Kinshasa)",
    externalLink:
      "https://www.linkedin.com/posts/anser-rdc_fondsmwinda-energiesolaire-shs-activity-7437894273477390337-Ymw4",
    type: "ami" as const,
    status: "active",
  },
  {
    id: 101,
    title: "AMI — Partenariat public-privé pour la gestion des déchets urbains",
    organization: "Communauté Urbaine de Douala",
    country: "Cameroun",
    deadline: "30 avril 2026",
    sector: "Environnement",
    amiType: "PPP",
    featured: false,
    description: "",
    partners: "",
    webinaire: "",
    externalLink: "",
    type: "ami" as const,
    status: "active",
  },
  {
    id: 102,
    title:
      "Recherche de partenaires — Programme d'électrification solaire rurale",
    organization: "Agence Nationale d'Électrification Rurale",
    country: "RDC",
    deadline: "15 mai 2026",
    sector: "Énergie",
    amiType: "Partenariat",
    featured: false,
    description: "",
    partners: "",
    webinaire: "",
    externalLink: "",
    type: "ami" as const,
    status: "active",
  },
  {
    id: 103,
    title: "AMI — Développement d'une plateforme numérique de santé",
    organization: "OMS Bureau Afrique Centrale",
    country: "Régional",
    deadline: "20 juin 2026",
    sector: "Santé / Tech",
    amiType: "AMI",
    featured: false,
    description: "",
    partners: "",
    webinaire: "",
    externalLink: "",
    type: "ami" as const,
    status: "active",
  },
  {
    id: 104,
    title: "Appel à projets — Incubation de startups agritech",
    organization: "BAD / Fonds vert",
    country: "Régional CEEAC",
    deadline: "10 mai 2026",
    sector: "Agriculture",
    amiType: "Appel à projets",
    featured: false,
    description: "",
    partners: "",
    webinaire: "",
    externalLink: "",
    type: "ami" as const,
    status: "active",
  },
  {
    id: 105,
    title: "AMI — Consultant en gouvernance forestière REDD+",
    organization: "COMIFAC",
    country: "Régional",
    deadline: "25 avril 2026",
    sector: "Environnement",
    amiType: "AMI",
    featured: false,
    description: "",
    partners: "",
    webinaire: "",
    externalLink: "",
    type: "ami" as const,
    status: "active",
  },
];

const sampleJobs = [
  {
    id: 201,
    title: "Économiste principal — Bureau régional Afrique Centrale",
    organization: "Banque Africaine de Développement",
    country: "Cameroun",
    deadline: "20 mars 2026",
    contractType: "CDI",
    experienceLevel: "Senior",
    featured: false,
    externalLink: "",
    description: "",
    type: "job" as const,
    status: "active",
  },
  {
    id: 202,
    title: "Chargé(e) de programme — Finance climatique",
    organization: "PNUD Gabon",
    country: "Gabon",
    deadline: "15 avril 2026",
    contractType: "CDD 2 ans",
    experienceLevel: "Confirmé",
    featured: false,
    externalLink: "",
    description: "",
    type: "job" as const,
    status: "active",
  },
  {
    id: 203,
    title: "Analyste données — Observatoire économique CEEAC",
    organization: "Commission CEEAC",
    country: "Gabon",
    deadline: "30 mars 2026",
    contractType: "CDI",
    experienceLevel: "Junior/Confirmé",
    featured: false,
    externalLink: "",
    description: "",
    type: "job" as const,
    status: "active",
  },
  {
    id: 204,
    title: "Stage — Rédaction économique et data journalism",
    organization: "Habari Magazine",
    country: "Cameroun / Remote",
    deadline: "Ouvert",
    contractType: "Stage 6 mois",
    experienceLevel: "Étudiant",
    featured: false,
    externalLink: "",
    description: "",
    type: "job" as const,
    status: "active",
  },
  {
    id: 205,
    title: "Directeur(trice) des investissements — Fonds souverain",
    organization: "Fonds Gabonais d'Investissements Stratégiques",
    country: "Gabon",
    deadline: "10 avril 2026",
    contractType: "CDI",
    experienceLevel: "Directeur",
    featured: false,
    externalLink: "",
    description: "",
    type: "job" as const,
    status: "active",
  },
  {
    id: 206,
    title: "Consultant(e) en transformation digitale",
    organization: "Banque Mondiale — Bureau Kinshasa",
    country: "RDC",
    deadline: "25 avril 2026",
    contractType: "Mission 12 mois",
    experienceLevel: "Senior",
    featured: false,
    externalLink: "",
    description: "",
    type: "job" as const,
    status: "active",
  },
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

  // Fetch from DB
  const { data: dbBids, isLoading: loadingBids } =
    trpc.opportunities.list.useQuery({ type: "bid" });
  const { data: dbAMI, isLoading: loadingAMI } =
    trpc.opportunities.list.useQuery({ type: "ami" });
  const { data: dbJobs, isLoading: loadingJobs } =
    trpc.opportunities.list.useQuery({ type: "job" });

  // Normalize DB data to match sample shape, fallback to samples
  const normalizeBids = (items: typeof dbBids) =>
    items?.map(i => ({
      ...i,
      deadline: i.deadline ?? "",
      sector: i.sector ?? "",
      budget: i.budget ?? "",
      currency: i.currency ?? "USD",
      description: i.description ?? "",
      externalLink: i.externalLink ?? "",
      featured: i.featured ?? false,
      type: "bid" as const,
    })) ?? [];

  const normalizeAMI = (items: typeof dbAMI) =>
    items?.map(i => ({
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
    })) ?? [];

  const normalizeJobs = (items: typeof dbJobs) =>
    items?.map(i => ({
      ...i,
      deadline: i.deadline ?? "",
      description: i.description ?? "",
      externalLink: i.externalLink ?? "",
      contractType: i.contractType ?? "",
      experienceLevel: i.experienceLevel ?? "",
      featured: i.featured ?? false,
      type: "job" as const,
    })) ?? [];

  const bidsData =
    dbBids && dbBids.length > 0 ? normalizeBids(dbBids) : sampleBids;
  const amiData = dbAMI && dbAMI.length > 0 ? normalizeAMI(dbAMI) : sampleAMI;
  const jobsData =
    dbJobs && dbJobs.length > 0 ? normalizeJobs(dbJobs) : sampleJobs;

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
                        {bid.externalLink ? (
                          <a
                            href={bid.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-sans font-medium text-primary hover:underline"
                          >
                            Voir les détails{" "}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-sans text-primary gap-1 p-0 h-auto"
                          >
                            Voir les détails <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
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
                        {item.externalLink ? (
                          <a
                            href={item.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-sans font-medium text-primary hover:underline"
                          >
                            Voir les détails{" "}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-sans text-primary gap-1 p-0 h-auto"
                          >
                            Voir les détails <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
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
                        {job.externalLink ? (
                          <a
                            href={job.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-sans font-medium text-primary hover:underline"
                          >
                            Postuler <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-sans text-primary gap-1 p-0 h-auto"
                          >
                            Postuler <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
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

      <Footer />
    </div>
  );
}
