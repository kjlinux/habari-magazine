import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search, Users, Briefcase, MapPin, MessageCircle, UserPlus,
  Globe, Loader2, CheckCircle2
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CATEGORIES = ["Entrepreneurs", "Investisseurs", "Décideurs", "Consultants", "Startups", "ONG & Institutions"];

const COUNTRIES = [
  "Angola", "Burundi", "Cameroun", "Congo", "Gabon",
  "Guinée Équatoriale", "RCA", "RDC", "Rwanda", "Tchad",
];

const COUNTRY_FLAGS: Record<string, string> = {
  "RDC": "🇨🇩", "Cameroun": "🇨🇲", "Gabon": "🇬🇦", "Congo": "🇨🇬",
  "RCA": "🇨🇫", "Tchad": "🇹🇩", "Guinée Équatoriale": "🇬🇶",
  "Burundi": "🇧🇮", "Rwanda": "🇷🇼", "Angola": "🇦🇴",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const EMPTY_FORM = {
  name: "", role: "", company: "", country: "", category: "", bio: "", linkedin: "", email: "",
};

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: members = [], isLoading } = trpc.community.list.useQuery({ limit: 100, offset: 0 });

  const joinMutation = trpc.community.join.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => toast.error(err.message || "Une erreur est survenue"),
  });

  const filtered = useMemo(() => {
    let list = members as any[];
    if (selectedCategory) list = list.filter((m) => m.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) =>
        m.name?.toLowerCase().includes(q) ||
        m.company?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.country?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, selectedCategory, searchQuery]);

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error("Le nom est requis");
    joinMutation.mutate({
      name: form.name,
      role: form.role || undefined,
      company: form.company || undefined,
      country: form.country || undefined,
      category: form.category || undefined,
      bio: form.bio || undefined,
      linkedin: form.linkedin || undefined,
      email: form.email || undefined,
    });
  };

  const handleClose = () => {
    setJoinOpen(false);
    setSubmitted(false);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-[oklch(0.20_0.02_250)] py-14">
        <div className="container">
          <div className="habari-rubrique text-[oklch(0.72_0.15_75)] mb-3">Communauté</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Communauté Habari</h1>
          <div className="w-20 h-1 bg-[oklch(0.72_0.15_75)] mb-4"></div>
          <p className="text-lg text-white/60 font-sans max-w-2xl">
            Réseau professionnel des entrepreneurs, investisseurs et décideurs d'Afrique Centrale.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-serif">{(members as any[]).length > 0 ? `${(members as any[]).length}+` : "—"}</div>
              <div className="text-sm text-white/50 font-sans">Membres</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-serif">10</div>
              <div className="text-sm text-white/50 font-sans">Pays CEEAC</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white font-serif">15+</div>
              <div className="text-sm text-white/50 font-sans">Secteurs</div>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="mt-8 font-sans gap-2 bg-[oklch(0.72_0.15_75)] hover:bg-[oklch(0.65_0.15_75)] text-white border-0"
          >
            <UserPlus className="w-4 h-4" /> Rejoindre la communauté
          </Button>
        </div>
      </section>

      <section className="border-b border-border sticky top-16 bg-background/98 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${!selectedCategory ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Tous les membres
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-colors ${selectedCategory === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
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
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-sans mb-6">
                {(members as any[]).length === 0
                  ? "Soyez le premier à rejoindre la communauté Habari."
                  : "Aucun membre ne correspond à votre recherche."}
              </p>
              {(members as any[]).length === 0 && (
                <Button type="button" onClick={() => setJoinOpen(true)} className="font-sans gap-2">
                  <UserPlus className="w-4 h-4" /> Rejoindre la communauté
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((member: any) => (
                <Card key={member.id} className="border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-serif font-bold text-primary text-lg overflow-hidden">
                        {member.avatar
                          ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          : getInitials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-foreground truncate">{member.name}</h3>
                          {member.verified && (
                            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                        {member.role && <p className="text-sm text-[oklch(0.72_0.15_75)] font-sans font-medium truncate">{member.role}</p>}
                        {member.company && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground font-sans truncate">{member.company}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {member.bio && <p className="text-sm text-muted-foreground font-sans line-clamp-2 mb-4">{member.bio}</p>}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
                        {member.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {COUNTRY_FLAGS[member.country] || "🌍"} {member.country}
                          </span>
                        )}
                      </div>
                      {member.category && (
                        <span className="px-2 py-0.5 bg-muted rounded text-xs font-sans text-muted-foreground">{member.category}</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.linkedin && (
                        <Button type="button" size="sm" variant="outline" className="flex-1 font-sans text-xs h-8 gap-1" asChild>
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                            <UserPlus className="w-3 h-3" /> LinkedIn
                          </a>
                        </Button>
                      )}
                      {member.email && (
                        <Button type="button" size="sm" variant="outline" className="flex-1 font-sans text-xs h-8 gap-1" asChild>
                          <a href={`mailto:${member.email}`}>
                            <MessageCircle className="w-3 h-3" /> Contacter
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(members as any[]).length > 0 && (
            <div className="mt-16 bg-muted/40 rounded-2xl p-8 text-center border border-border">
              <Globe className="w-10 h-10 text-primary/40 mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Vous êtes professionnel de la zone CEEAC ?</h2>
              <p className="text-muted-foreground font-sans max-w-lg mx-auto mb-6">
                Rejoignez le réseau et soyez visible auprès des entrepreneurs, investisseurs et décideurs d'Afrique Centrale.
              </p>
              <Button type="button" onClick={() => setJoinOpen(true)} className="font-sans px-8 gap-2">
                <UserPlus className="w-4 h-4" /> Rejoindre la communauté
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Dialog formulaire */}
      <Dialog open={joinOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Rejoindre la communauté Habari</DialogTitle>
            <DialogDescription className="font-sans text-sm">
              Votre fiche sera visible après validation par notre équipe (sous 48h).
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">Demande envoyée !</h3>
              <p className="text-sm text-muted-foreground font-sans max-w-xs mx-auto mb-6">
                Notre équipe examinera votre profil sous 48h. Vous serez affiché dans l'annuaire après validation.
              </p>
              <Button type="button" onClick={handleClose} className="font-sans">Fermer</Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-sans font-medium">Nom complet *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                  className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-sans font-medium">Fonction / Titre</label>
                  <input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Ex: Directeur Général"
                    className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-sans font-medium">Entreprise / Organisation</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Ex: Habari Group"
                    className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-sans font-medium">Pays</label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">— Sélectionner —</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-sans font-medium">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">— Sélectionner —</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-sans font-medium">Bio courte <span className="text-muted-foreground">(max 500 caractères)</span></label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  maxLength={500}
                  placeholder="Présentez-vous en quelques mots..."
                  className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <p className="text-xs text-muted-foreground font-sans text-right mt-1">{form.bio.length}/500</p>
              </div>
              <div>
                <label className="text-sm font-sans font-medium">Profil LinkedIn</label>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-sans font-medium">Email professionnel</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@exemple.com"
                  className="mt-1 w-full px-3 py-2 text-sm font-sans border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-muted-foreground font-sans mt-1">Visible uniquement par les membres de la communauté.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1 font-sans">Annuler</Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={joinMutation.isPending || !form.name.trim()}
                  className="flex-1 font-sans gap-2"
                >
                  {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Envoyer ma demande
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
