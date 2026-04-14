import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Handshake, FileText, ArrowRight, Mail } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tabs = [
  { id: "communiques", label: "Communiqués", icon: Megaphone },
  { id: "sponsorise", label: "Contenus sponsorisés", icon: Handshake },
  { id: "rapports", label: "Rapports & études", icon: FileText },
];

const sampleContent = {
  communiques: [
    { id: 1, title: "La BDEAC annonce un nouveau programme de financement vert de 500M USD", source: "BDEAC", date: "Mars 2026", excerpt: "La Banque de Développement des États de l'Afrique Centrale lance un programme ambitieux pour financer la transition énergétique dans les 11 pays membres.", tag: "Finance" },
    { id: 2, title: "Bolloré Transport & Logistics inaugure le terminal à conteneurs de Douala", source: "Bolloré Africa Logistics", date: "Février 2026", excerpt: "Le nouveau terminal portuaire augmente la capacité de traitement de 40%, renforçant la compétitivité du corridor Douala-Bangui.", tag: "Infrastructure" },
    { id: 3, title: "MTN Cameroun dépasse les 15 millions d'abonnés mobile money", source: "MTN Group", date: "Février 2026", excerpt: "MTN Mobile Money confirme sa position de leader de la finance mobile en Afrique Centrale avec une croissance de 28% sur un an.", tag: "Fintech" },
    { id: 4, title: "TotalEnergies signe un accord d'exploration gazière au Congo", source: "TotalEnergies EP Congo", date: "Janvier 2026", excerpt: "L'accord porte sur deux blocs offshore dans le bassin du Bas-Congo, avec un investissement initial de 200M USD.", tag: "Énergie" },
  ],
  sponsorise: [
    { id: 5, title: "Comment la digitalisation transforme les PME d'Afrique Centrale", source: "SAP Africa", date: "Mars 2026", excerpt: "Les solutions cloud permettent aux entreprises de la zone CEEAC de gagner en compétitivité. Retour sur les success stories de la transformation digitale.", tag: "Technologie" },
    { id: 6, title: "Investir dans l'immobilier à Libreville : les opportunités 2026", source: "Groupe Addoha", date: "Février 2026", excerpt: "Le marché immobilier gabonais offre des rendements attractifs pour les investisseurs. Analyse des quartiers à fort potentiel.", tag: "Immobilier" },
  ],
  rapports: [
    { id: 7, title: "Perspectives économiques en Afrique Centrale 2026", source: "BAD / BAfD", date: "Mars 2026", excerpt: "Le rapport annuel de la Banque Africaine de Développement analyse les tendances macroéconomiques et les perspectives de croissance de la sous-région.", tag: "Macroéconomie" },
    { id: 8, title: "État des lieux du marché carbone en zone COMIFAC", source: "COMIFAC / PNUD", date: "Janvier 2026", excerpt: "Cartographie complète des projets REDD+ et des crédits carbone générés par le bassin du Congo.", tag: "Environnement" },
  ],
};

export default function Partners() {
  const [activeTab, setActiveTab] = useState("communiques");
  const items = sampleContent[activeTab as keyof typeof sampleContent] || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Écosystème</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Contenus Partenaires</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Communiqués de presse, contenus sponsorisés et rapports d'institutions partenaires de l'écosystème économique d'Afrique Centrale.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-3">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-sans font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-sans font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">{item.tag}</span>
                    <span className="text-xs font-sans text-muted-foreground">{item.date}</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-foreground mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground font-sans line-clamp-3 mb-4">{item.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs font-sans text-muted-foreground">
                      Source : <span className="font-medium text-foreground">{item.source}</span>
                    </span>
                    <Button variant="ghost" size="sm" className="font-sans text-primary gap-1 p-0 h-auto">
                      Lire <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-20">
              <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans">Aucun contenu disponible dans cette catégorie.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-primary mb-3">Vous souhaitez publier un contenu partenaire ?</h2>
          <p className="text-muted-foreground font-sans mb-6 max-w-lg mx-auto">
            Communiqués de presse, publi-reportages, rapports d'études — contactez notre régie publicitaire pour diffuser votre contenu auprès des décideurs d'Afrique Centrale.
          </p>
          <a href="mailto:partenaires@habarimag.com">
            <Button className="font-sans bg-primary hover:bg-primary/90">
              <Mail className="w-4 h-4 mr-2" /> Nous contacter
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
