import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, FileText, Leaf, BookOpen, Download, ExternalLink, Gift } from "lucide-react";

const guides = [
  { title: "Guide NDC — Contributions nationales déterminées", desc: "Analyse des engagements climatiques des 11 pays CEEAC dans le cadre de l'Accord de Paris.", category: "Guide pays", pages: "45 pages" },
  { title: "Manuel REDD+ pour les communautés locales", desc: "Guide pratique pour comprendre et participer aux projets REDD+ en Afrique Centrale.", category: "Guide pratique", pages: "32 pages" },
  { title: "Méthodologie MRV — Mesure, Rapportage, Vérification", desc: "Outils et protocoles pour le suivi des émissions de gaz à effet de serre dans la zone CEEAC.", category: "Outil technique", pages: "60 pages" },
];

const reports = [
  { title: "État des forêts du bassin du Congo 2024", source: "COMIFAC / OFAC", year: "2024", desc: "Rapport de référence sur l'état des forêts, la déforestation et la gouvernance forestière." },
  { title: "Climate Finance in Africa 2024", source: "Climate Policy Initiative", year: "2024", desc: "Analyse des flux de finance climat vers l'Afrique, avec focus sur l'Afrique Centrale." },
  { title: "Africa Energy Outlook 2024", source: "IEA", year: "2024", desc: "Perspectives énergétiques pour l'Afrique, incluant le potentiel ENR de la zone CEEAC." },
  { title: "Voluntary Carbon Markets Report", source: "Ecosystem Marketplace", year: "2025", desc: "État du marché volontaire du carbone, avec données sur les projets forestiers africains." },
  { title: "CAFI Annual Report 2024", source: "CAFI", year: "2024", desc: "Bilan annuel de l'Initiative pour les Forêts d'Afrique Centrale." },
];

const regulations = [
  { title: "Accord de Paris — NDC des pays CEEAC", type: "Engagement international", desc: "Synthèse des contributions nationales déterminées des 11 pays membres." },
  { title: "Plan de convergence COMIFAC 2026-2030", type: "Politique régionale", desc: "Nouveau cadre stratégique pour la gestion durable des forêts d'Afrique Centrale." },
  { title: "Code forestier de la RDC (2002, révisé 2023)", type: "Législation nationale", desc: "Cadre juridique de la gestion forestière en République Démocratique du Congo." },
  { title: "Loi climat du Gabon (2021)", type: "Législation nationale", desc: "Première loi climat d'Afrique Centrale, incluant le cadre carbone national." },
  { title: "Stratégie REDD+ du Cameroun", type: "Stratégie nationale", desc: "Document de stratégie nationale pour la réduction des émissions liées à la déforestation." },
];

export default function GreenRessources() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-[oklch(0.97_0.01_155)] border-b border-border py-3">
        <div className="container flex items-center gap-2 text-sm font-sans">
          <Link href="/green" className="text-[oklch(0.45_0.15_145)] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Habari Green
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Ressources</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[oklch(0.18_0.04_155)] py-16">
        <div className="container">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[oklch(0.75_0.18_145)]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.75_0.18_145)]">Habari Green</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            <span className="text-[oklch(0.75_0.18_145)]">Ressources</span> & documentation
          </h1>
          <p className="text-white/60 font-sans max-w-2xl">
            Guides pratiques, rapports de référence, outils méthodologiques et veille réglementaire
            pour les professionnels de l'économie verte en Afrique Centrale.
          </p>
        </div>
      </section>

      {/* Guides pratiques */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4 text-[oklch(0.45_0.15_145)]" />
            <h2 className="font-serif text-2xl font-bold text-primary">Guides pratiques Habari Green</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guides.map((guide) => (
              <Card key={guide.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-sans bg-[oklch(0.45_0.15_145)]/10 text-[oklch(0.35_0.12_145)] px-2 py-0.5 rounded-full font-medium">
                      {guide.category}
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">{guide.pages}</span>
                  </div>
                  <h3 className="font-serif font-bold text-foreground mb-2 text-sm leading-snug">{guide.title}</h3>
                  <p className="text-xs text-muted-foreground font-sans mb-3">{guide.desc}</p>
                  <Button variant="outline" size="sm" className="w-full font-sans text-xs border-[oklch(0.45_0.15_145)]/30 text-[oklch(0.35_0.12_145)]" onClick={() => {}}>
                    <Download className="w-3 h-3 mr-1.5" /> Bientôt disponible
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rapports de référence */}
      <section className="py-12 bg-muted/30 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Rapports de référence</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.title} className="bg-background border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-foreground text-sm">{report.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans mb-1">{report.source} — {report.year}</p>
                    <p className="text-xs text-muted-foreground font-sans">{report.desc}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 text-[oklch(0.45_0.15_145)]">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Veille réglementaire */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Veille réglementaire climat</h2>
          <div className="space-y-3">
            {regulations.map((reg) => (
              <div key={reg.title} className="bg-background border border-border rounded-lg p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-sans bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{reg.type}</span>
                    </div>
                    <h3 className="font-serif font-bold text-foreground text-sm mb-1">{reg.title}</h3>
                    <p className="text-xs text-muted-foreground font-sans">{reg.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[oklch(0.18_0.04_155)]">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Accédez à toutes les ressources</h2>
          <p className="text-white/60 font-sans mb-6 max-w-lg mx-auto">
            Guides téléchargeables, rapports complets, alertes réglementaires. Gratuit jusqu'au 1er juin 2026.
          </p>
          <Link href="/inscription">
            <Button size="lg" className="font-sans bg-[oklch(0.75_0.18_145)] text-[oklch(0.15_0.04_155)] hover:bg-[oklch(0.80_0.18_145)] font-semibold">
              <Gift className="w-4 h-4 mr-2" /> S'inscrire gratuitement
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
