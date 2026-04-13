import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useState } from "react";
import {
  Target,
  Eye,
  Compass,
  BookOpen,
  Users,
  Globe,
  TrendingUp,
  Award,
  ArrowRight,
  Mail,
  Building2,
  Lightbulb,
  Handshake,
  BarChart3,
  Send,
  CheckCircle2,
  Loader2,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const teamMembers = [
  {
    name: "Directeur de la publication",
    role: "Direction éditoriale",
    description:
      "Supervise la ligne éditoriale et garantit la qualité des analyses publiées. Assure le positionnement stratégique du magazine auprès des décideurs de la zone CEEAC.",
    initials: "DP",
  },
  {
    name: "Rédacteur en chef",
    role: "Coordination rédactionnelle",
    description:
      "Coordonne l'ensemble des contenus, du dossier central aux analyses pays. Pilote le comité de rédaction et veille à la cohérence éditoriale de chaque numéro.",
    initials: "RC",
  },
  {
    name: "Responsable Économie & Finance",
    role: "Analyses macroéconomiques",
    description:
      "Expert des dynamiques économiques de la zone CEEAC. Rédige le Baromètre mensuel et les analyses des politiques monétaires de la BEAC.",
    initials: "EF",
  },
  {
    name: "Responsable Business & Innovation",
    role: "Entrepreneuriat & secteur privé",
    description:
      "Identifie et met en lumière les entrepreneurs et innovateurs qui transforment l'économie régionale. Couvre les sujets de transformation digitale et d'innovation frugale.",
    initials: "BI",
  },
  {
    name: "Responsable Annuaire & Networking",
    role: "Mise en relation économique",
    description:
      "Développe et anime le répertoire des acteurs économiques. Facilite les connexions entre entreprises, investisseurs et institutions de la zone CEEAC.",
    initials: "AN",
  },
  {
    name: "Responsable Événements",
    role: "PME-Bright Forum & événementiel",
    description:
      "Organise les événements phares de Habari : PME-Bright Forum, petits-déjeuners décideurs et Habari Awards. Crée les espaces de rencontre entre acteurs économiques.",
    initials: "EV",
  },
];

const values = [
  {
    icon: BookOpen,
    title: "Rigueur analytique",
    description:
      "Chaque article, chaque dossier repose sur des données vérifiées, des sources identifiées et une méthodologie transparente. Nous privilégions la profondeur à la vitesse.",
  },
  {
    icon: Compass,
    title: "Indépendance éditoriale",
    description:
      "Habari n'est l'organe d'aucun gouvernement, d'aucune institution, d'aucun groupe d'intérêt. Notre crédibilité repose sur notre capacité à analyser sans complaisance.",
  },
  {
    icon: Globe,
    title: "Ancrage régional",
    description:
      "Nous pensons la zone CEEAC comme un espace économique intégré. Chaque sujet est traité dans sa dimension régionale, au-delà des frontières nationales.",
  },
  {
    icon: Lightbulb,
    title: "Accessibilité",
    description:
      "Sérieux sans être austère, technique sans être hermétique. Nous rendons les enjeux économiques compréhensibles pour tous les décideurs, quel que soit leur profil.",
  },
];

const milestones = [
  {
    year: "2025",
    title: "Genèse du projet",
    description:
      "Conception éditoriale et développement de la plateforme digitale par le Groupe Sixième Sens.",
  },
  {
    year: "2026 T1",
    title: "Numéro 0 — Lancement",
    description:
      "Publication du numéro inaugural avec le dossier « Panne sèche à la CEMAC » et lancement de la plateforme web.",
  },
  {
    year: "2026 T1",
    title: "PME-Bright Forum — Douala",
    description:
      "Premier événement Habari réunissant entrepreneurs, investisseurs et décideurs publics de la zone CEEAC.",
  },
  {
    year: "2026 T2",
    title: "Habari Awards — Édition inaugurale",
    description:
      "Cérémonie de reconnaissance des acteurs économiques qui contribuent à l'intégration régionale.",
  },
];

const contactCategories = [
  { value: "general", label: "Question générale" },
  { value: "editorial", label: "Proposition éditoriale" },
  { value: "partnership", label: "Demande de partenariat" },
  { value: "advertising", label: "Publicité & Sponsoring" },
  { value: "subscription", label: "Abonnement & Accès" },
  { value: "other", label: "Autre" },
];

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message envoyé avec succès !");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCategory("general");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'envoi du message");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      name,
      email,
      subject,
      message,
      category: category as "general" | "editorial" | "partnership" | "advertising" | "subscription" | "other",
    });
  };

  if (submitted) {
    return (
      <div className="bg-background rounded-xl p-12 border border-border shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
          Message envoyé !
        </h3>
        <p className="text-foreground/60 font-sans mb-6 leading-relaxed max-w-md mx-auto">
          Merci pour votre message. L'équipe Habari vous répondra dans les
          meilleurs délais.
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="outline"
          className="font-sans border-primary text-primary hover:bg-primary/5"
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background rounded-xl p-8 border border-border shadow-sm"
    >
      <h3 className="font-serif text-lg font-bold text-foreground mb-6">
        Envoyez-nous un message
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {/* Nom */}
        <div>
          <label className="block font-sans text-sm font-medium text-foreground mb-1.5">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            placeholder="Votre nom"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-sans text-sm font-medium text-foreground mb-1.5">
            Adresse email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="votre@email.com"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {/* Catégorie */}
        <div>
          <label className="block font-sans text-sm font-medium text-foreground mb-1.5">
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            {contactCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sujet */}
        <div>
          <label className="block font-sans text-sm font-medium text-foreground mb-1.5">
            Sujet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            minLength={5}
            placeholder="Objet de votre message"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="block font-sans text-sm font-medium text-foreground mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={20}
          rows={6}
          placeholder="Décrivez votre demande en détail..."
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitMutation.isPending}
        className="font-sans bg-primary hover:bg-primary/90 w-full sm:w-auto px-8"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Envoyer le message
          </>
        )}
      </Button>

      <p className="font-sans text-xs text-foreground/40 mt-4">
        En envoyant ce formulaire, vous acceptez que vos données soient
        traitées par l'équipe Habari dans le cadre de votre demande.
      </p>
    </form>
  );
}

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-[oklch(0.20_0.02_250)] text-white py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl">
            <p className="text-[oklch(0.72_0.15_75)] font-sans text-sm font-semibold tracking-widest uppercase mb-4">
              À propos
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              Comprendre l'Afrique Centrale pour mieux agir
            </h1>
            <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mb-6"></div>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-sans">
              Habari — « nouvelles » en swahili — est la plateforme de connexion
              économique de référence pour l'intégration de l'Afrique Centrale. Magazine
              trimestriel, annuaire des acteurs, espace investisseurs et
              événements : un écosystème complet au service des décideurs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Mission */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Notre mission
                </h2>
              </div>
              <p className="text-foreground/70 leading-relaxed font-sans mb-4">
                Habari a pour mission de <strong>connecter les acteurs économiques</strong> de la
                Communauté Économique et Monétaire de l'Afrique Centrale en
                produisant des analyses de fond, des données fiables et un réseau
                de mise en relation au service de l'intégration régionale.
              </p>
              <p className="text-foreground/70 leading-relaxed font-sans mb-4">
                Dans un espace économique de <strong>58 millions d'habitants</strong> et un PIB
                cumulé de <strong>~105 milliards de dollars</strong>, l'information économique de
                qualité reste rare. Habari comble ce vide en proposant un regard
                rigoureux, indépendant et constructif sur les dynamiques
                économiques de la zone.
              </p>
              <p className="text-foreground/70 leading-relaxed font-sans">
                Notre promesse : <em>comprendre l'Afrique Centrale pour mieux y
                décider, y investir et y agir</em>.
              </p>
            </div>

            {/* Vision */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[oklch(0.72_0.15_75)]/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[oklch(0.72_0.15_75)]" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Notre vision
                </h2>
              </div>
              <p className="text-foreground/70 leading-relaxed font-sans mb-4">
                Nous croyons que l'intégration économique de la zone CEEAC est
                non seulement souhaitable, mais possible. Elle passe par une
                meilleure circulation de l'information, une mise en réseau des
                acteurs et une valorisation des initiatives qui fonctionnent.
              </p>
              <p className="text-foreground/70 leading-relaxed font-sans mb-4">
                Habari ambitionne de devenir <strong>la référence incontournable</strong> pour
                quiconque souhaite comprendre, investir ou entreprendre dans
                l'espace CEEAC — qu'il s'agisse de décideurs publics, de
                dirigeants d'entreprises, d'investisseurs internationaux ou
                d'experts du développement.
              </p>
              <p className="text-foreground/70 leading-relaxed font-sans">
                À terme, Habari vise à constituer le <strong>premier écosystème digital</strong>{" "}
                dédié à l'économie de l'Afrique Centrale, combinant média,
                données, networking et événementiel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ADN / Valeurs */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[oklch(0.72_0.15_75)] font-sans text-sm font-semibold tracking-widest uppercase mb-3">
              Notre ADN
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Les valeurs qui nous guident
            </h2>
            <p className="text-foreground/60 font-sans max-w-2xl mx-auto">
              Sérieux mais accessible. Africain sans folklore. Institutionnel
              sans être officiel. Moderne sans être militant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-background rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-foreground/60 font-sans text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Écosystème Habari */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-primary font-sans text-sm font-semibold tracking-widest uppercase mb-3">
              Nos piliers
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              L'écosystème Habari
            </h2>
            <p className="text-foreground/60 font-sans max-w-2xl mx-auto">
              Au-delà du magazine, Habari est une plateforme intégrée qui
              connecte information, réseau et action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-[oklch(0.20_0.02_250)] rounded-xl p-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <BookOpen className="w-8 h-8 text-[oklch(0.72_0.15_75)] mb-5" />
                <h3 className="font-serif text-lg font-bold mb-3">
                  Magazine trimestriel
                </h3>
                <p className="text-white/60 text-sm font-sans leading-relaxed">
                  Dossiers de fond, interviews exclusives, analyses pays et
                  baromètre économique mensuel. 2 à 4 contenus par mois, la
                  qualité avant la quantité.
                </p>
              </div>
            </div>

            <div className="group relative bg-[oklch(0.20_0.02_250)] rounded-xl p-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Users className="w-8 h-8 text-[oklch(0.72_0.15_75)] mb-5" />
                <h3 className="font-serif text-lg font-bold mb-3">
                  Annuaire & Networking
                </h3>
                <p className="text-white/60 text-sm font-sans leading-relaxed">
                  Répertoire des acteurs économiques clés de la zone CEEAC.
                  Entreprises, institutions, investisseurs : trouvez les bons
                  interlocuteurs.
                </p>
              </div>
            </div>

            <div className="group relative bg-[oklch(0.20_0.02_250)] rounded-xl p-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <TrendingUp className="w-8 h-8 text-[oklch(0.72_0.15_75)] mb-5" />
                <h3 className="font-serif text-lg font-bold mb-3">
                  Espace investisseurs
                </h3>
                <p className="text-white/60 text-sm font-sans leading-relaxed">
                  Opportunités d'investissement qualifiées dans les onze pays de
                  la CEEAC. Deal flow, analyses sectorielles et mise en relation
                  avec les porteurs de projets.
                </p>
              </div>
            </div>

            <div className="group relative bg-[oklch(0.20_0.02_250)] rounded-xl p-8 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Award className="w-8 h-8 text-[oklch(0.72_0.15_75)] mb-5" />
                <h3 className="font-serif text-lg font-bold mb-3">
                  Événementiel
                </h3>
                <p className="text-white/60 text-sm font-sans leading-relaxed">
                  PME-Bright Forum, petits-déjeuners décideurs et Habari Awards.
                  Des espaces de rencontre pour catalyser les partenariats et
                  l'intégration régionale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Équipe éditoriale */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[oklch(0.72_0.15_75)] font-sans text-sm font-semibold tracking-widest uppercase mb-3">
              L'équipe
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              La rédaction Habari
            </h2>
            <p className="text-foreground/60 font-sans max-w-2xl mx-auto">
              Une équipe pluridisciplinaire d'analystes, de journalistes et
              d'experts de l'économie africaine, réunie par la conviction que
              l'information de qualité est un levier d'intégration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="bg-background rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="bg-[oklch(0.20_0.02_250)] p-8 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                    <span className="font-serif text-xl font-bold text-white">
                      {member.initials}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-[oklch(0.72_0.15_75)] text-xs font-sans font-semibold uppercase tracking-wider mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-foreground/60 font-sans text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Jalons */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-primary font-sans text-sm font-semibold tracking-widest uppercase mb-3">
              Notre parcours
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Les jalons de Habari
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, i) => (
              <div key={i} className="flex gap-6 mb-10 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                    <span className="font-sans text-xs font-bold text-primary">
                      {milestone.year.split(" ")[0]}
                    </span>
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/20 mt-2"></div>
                  )}
                </div>
                <div className="pb-10 last:pb-0">
                  <span className="text-[oklch(0.72_0.15_75)] font-sans text-xs font-semibold uppercase tracking-wider">
                    {milestone.year}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-foreground mt-1 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-foreground/60 font-sans text-sm leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Groupe Sixième Sens */}
      <section className="py-20 bg-[oklch(0.20_0.02_250)] text-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[oklch(0.72_0.15_75)] font-sans text-sm font-semibold tracking-widest uppercase mb-4">
                L'éditeur
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                Groupe Sixième Sens
              </h2>
              <div className="w-16 h-1 bg-[oklch(0.72_0.15_75)] mb-6"></div>
              <p className="text-white/70 font-sans leading-relaxed mb-4">
                Habari est une publication du <strong className="text-white">Groupe Sixième Sens</strong>,
                agence de conseil en stratégie et communication spécialisée dans
                l'accompagnement des acteurs économiques en Afrique Centrale.
              </p>
              <p className="text-white/70 font-sans leading-relaxed mb-4">
                Fort de son expertise dans la production de contenus à haute
                valeur ajoutée et l'organisation d'événements professionnels, le
                Groupe Sixième Sens a conçu Habari comme un outil au service de
                l'intégration économique régionale.
              </p>
              <p className="text-white/70 font-sans leading-relaxed mb-6">
                Le groupe intervient dans les domaines du conseil stratégique, de
                la communication institutionnelle, de la production éditoriale et
                de l'événementiel d'affaires.
              </p>
              <a
                href="https://www.sixiemesens.agency"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="font-sans border-[oklch(0.72_0.15_75)] text-[oklch(0.72_0.15_75)] hover:bg-[oklch(0.72_0.15_75)]/10"
                >
                  Découvrir le Groupe Sixième Sens
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <Building2 className="w-8 h-8 text-[oklch(0.72_0.15_75)] mb-4" />
                <h4 className="font-serif font-bold text-white mb-2">
                  Conseil stratégique
                </h4>
                <p className="text-white/50 text-sm font-sans">
                  Accompagnement des entreprises et institutions dans leur
                  développement régional.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <BarChart3 className="w-8 h-8 text-[oklch(0.72_0.15_75)] mb-4" />
                <h4 className="font-serif font-bold text-white mb-2">
                  Production éditoriale
                </h4>
                <p className="text-white/50 text-sm font-sans">
                  Contenus à haute valeur ajoutée pour décideurs et
                  investisseurs.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <Handshake className="w-8 h-8 text-[oklch(0.72_0.15_75)] mb-4" />
                <h4 className="font-serif font-bold text-white mb-2">
                  Événementiel
                </h4>
                <p className="text-white/50 text-sm font-sans">
                  Forums, conférences et rencontres d'affaires en zone CEEAC.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <Globe className="w-8 h-8 text-[oklch(0.72_0.15_75)] mb-4" />
                <h4 className="font-serif font-bold text-white mb-2">
                  Communication
                </h4>
                <p className="text-white/50 text-sm font-sans">
                  Stratégies de communication institutionnelle et corporate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partenaires & Institutions */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[oklch(0.72_0.15_75)] font-sans text-sm font-semibold tracking-widest uppercase mb-3">
              Écosystème
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Institutions de référence
            </h2>
            <p className="text-foreground/60 font-sans max-w-2xl mx-auto">
              Habari s'appuie sur les données et analyses des principales
              institutions économiques de la zone CEEAC et du continent.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "CEEAC", desc: "Commission" },
              { name: "BEAC", desc: "Banque Centrale" },
              { name: "BDEAC", desc: "Banque de Développement" },
              { name: "FMI", desc: "Fonds Monétaire" },
              { name: "BAD", desc: "Banque Africaine" },
              { name: "BM", desc: "Banque Mondiale" },
            ].map((inst, i) => (
              <div
                key={i}
                className="bg-muted/30 rounded-xl p-6 text-center border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-serif font-bold text-primary text-sm">
                    {inst.name}
                  </span>
                </div>
                <p className="text-foreground/50 text-xs font-sans">
                  {inst.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[oklch(0.72_0.15_75)] font-sans text-sm font-semibold tracking-widest uppercase mb-3">
              Contact
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Contactez la rédaction
            </h2>
            <p className="text-foreground/60 font-sans max-w-2xl mx-auto">
              Pour toute question, proposition de contribution, demande de
              partenariat ou information sur nos services, n'hésitez pas à
              nous écrire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-background rounded-xl p-8 border border-border shadow-sm">
                <h3 className="font-serif text-lg font-bold text-foreground mb-6">
                  Informations de contact
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-foreground">Email</p>
                      <a href="mailto:redaction@habari.info" className="font-sans text-sm text-primary hover:underline">
                        redaction@habari.info
                      </a>
                      <br />
                      <a href="mailto:publicite@habari.info" className="font-sans text-sm text-primary hover:underline">
                        publicite@habari.info
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-foreground">Téléphone</p>
                      <p className="font-sans text-sm text-foreground/60">+237 6XX XXX XXX</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-foreground">Adresse</p>
                      <p className="font-sans text-sm text-foreground/60">Douala, Cameroun</p>
                      <p className="font-sans text-sm text-foreground/60">Zone CEEAC</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[oklch(0.20_0.02_250)] rounded-xl p-8 text-white">
                <h3 className="font-serif text-lg font-bold mb-3">
                  Vous souhaitez contribuer ?
                </h3>
                <p className="font-sans text-sm text-white/70 mb-4 leading-relaxed">
                  Habari accueille les tribunes d'experts, les analyses pays et
                  les témoignages d'entrepreneurs de la zone CEEAC.
                </p>
                <Link href="/abonnements">
                  <Button
                    variant="outline"
                    className="font-sans border-white/30 text-white hover:bg-white/10 w-full"
                  >
                    Découvrir nos offres
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
