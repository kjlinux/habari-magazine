import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Users, Leaf, Globe2, Building2, Shield, Gift } from "lucide-react";

const actors = [
  { name: "Wildlife Works", type: "Développeur carbone", country: "🇨🇩 RDC", focus: "REDD+, conservation", website: "wildlifeworks.com" },
  { name: "WWF Bassin du Congo", type: "ONG conservation", country: "🇨🇲🇨🇬🇬🇦🇨🇩", focus: "Forêts, biodiversité, aires protégées", website: "wwf.org" },
  { name: "WCS (Wildlife Conservation Society)", type: "ONG conservation", country: "🇨🇬🇬🇦🇨🇩", focus: "Parcs nationaux, faune sauvage", website: "wcs.org" },
  { name: "South Pole", type: "Développeur carbone", country: "🇬🇦🇨🇩", focus: "Crédits carbone, conseil climat", website: "southpole.com" },
  { name: "Verra", type: "Certificateur", country: "International", focus: "Standard VCS, certification carbone", website: "verra.org" },
  { name: "Gold Standard", type: "Certificateur", country: "International", focus: "Certification carbone premium", website: "goldstandard.org" },
  { name: "COMIFAC", type: "Institution régionale", country: "CEEAC", focus: "Politique forestière régionale", website: "comifac.org" },
  { name: "CAFI", type: "Initiative multilatérale", country: "Bassin du Congo", focus: "Financement REDD+, gouvernance", website: "cafi.org" },
  { name: "Proparco", type: "Institution financière", country: "Toute la zone", focus: "Financement ENR, PME vertes", website: "proparco.fr" },
  { name: "Mirova Natural Capital", type: "Fonds d'investissement", country: "Bassin du Congo", focus: "Capital naturel, forêts", website: "mirova.com" },
  { name: "ANPN (Gabon)", type: "Agence nationale", country: "🇬🇦 Gabon", focus: "Parcs nationaux, crédits carbone", website: "anpn.ga" },
  { name: "ICCN (RDC)", type: "Agence nationale", country: "🇨🇩 RDC", focus: "Conservation, aires protégées", website: "iccn.cd" },
];

const categories = [
  { name: "Développeurs carbone", count: 8, icon: Building2 },
  { name: "ONG environnement", count: 15, icon: Shield },
  { name: "Certificateurs", count: 4, icon: Shield },
  { name: "Institutions financières", count: 6, icon: Globe2 },
  { name: "Agences nationales", count: 11, icon: Building2 },
  { name: "Consultants climat", count: 12, icon: Users },
];

export default function GreenActeurs() {
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
          <span className="text-foreground font-medium">Acteurs verts</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.04_155)] py-16">
        <div className="container relative">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[oklch(0.75_0.18_145)]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[oklch(0.75_0.18_145)]">Habari Green</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Acteurs <span className="text-[oklch(0.75_0.18_145)]">verts</span>
          </h1>
          <p className="text-white/60 font-sans max-w-2xl">
            Annuaire des développeurs carbone, ONG environnementales, certificateurs, consultants climat
            et institutions financières actifs en Afrique Centrale.
          </p>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-10 bg-[oklch(0.97_0.01_155)] border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-background rounded-xl border border-border p-4 shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer">
                <cat.icon className="w-5 h-5 text-[oklch(0.45_0.15_145)] mx-auto mb-2" />
                <div className="text-lg font-serif font-bold text-foreground">{cat.count}</div>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des acteurs */}
      <section className="py-12">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Acteurs référencés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actors.map((actor) => (
              <Card key={actor.name} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[oklch(0.45_0.15_145)]/10 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-[oklch(0.45_0.15_145)]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-foreground text-sm">{actor.name}</h3>
                      <span className="text-xs font-sans text-muted-foreground">{actor.type}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans mb-1">{actor.country}</p>
                  <p className="text-xs text-muted-foreground font-sans mb-3">Focus : {actor.focus}</p>
                  <span className="text-xs font-sans text-[oklch(0.45_0.15_145)]">{actor.website}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground font-sans mb-4">
              Cet annuaire est en cours de constitution. Vous souhaitez y figurer ?
            </p>
            <Link href="/a-propos">
              <Button variant="outline" className="font-sans border-[oklch(0.45_0.15_145)]/30 text-[oklch(0.35_0.12_145)] hover:bg-[oklch(0.45_0.15_145)]/5">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[oklch(0.18_0.04_155)]">
        <div className="container text-center">
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Rejoignez l'annuaire vert</h2>
          <p className="text-white/60 font-sans mb-6 max-w-lg mx-auto">
            Accédez à l'annuaire complet et aux fiches détaillées. Gratuit jusqu'au 1er juin 2026.
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
