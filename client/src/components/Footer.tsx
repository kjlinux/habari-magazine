import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Footer() {
  const [nlEmail, setNlEmail] = useState("");
  const [nlDone, setNlDone] = useState(false);
  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => setNlDone(true),
  });

  const { data: settings } = trpc.siteConfig.homepageSettings.useQuery({
    keys: ["site_logo_url", "site_name", "contact_email", "social_twitter", "social_linkedin", "social_facebook", "social_instagram", "social_youtube"],
  });
  const get = (key: string, fallback = "") => settings?.[key] ?? fallback;

  return (
    <footer className="bg-[oklch(0.20_0.02_250)] text-white/80">
      {/* Main footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img
                src={get("site_logo_url", "/logo-habari.png")}
                alt={get("site_name", "Habari Mag")}
                className="h-12 w-auto brightness-[1.8] contrast-[0.9]"
              />
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Connexion économique pour l'intégration de l'Afrique Centrale. Comprendre, décider, investir, agir.
            </p>
            <div className="habari-separator bg-habari-gold! w-16!"></div>
            <p className="text-xs text-white/40 mt-4">
              Une publication du Groupe Sixième Sens
            </p>
          </div>

          {/* Rubriques */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-5 uppercase tracking-wider">Rubriques</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/magazine" className="text-white/60 hover:text-habari-gold transition-colors">Éditorial</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-habari-gold transition-colors">Dossier Central</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-habari-gold transition-colors">Interviews</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-habari-gold transition-colors">Business &amp; Innovation</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-habari-gold transition-colors">Analyse Pays</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-habari-gold transition-colors">Culture &amp; Société</Link></li>
              <li><Link href="/habari-green" className="text-white/60 hover:text-habari-gold transition-colors">Habari Green</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-5 uppercase tracking-wider">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/annuaire" className="text-white/60 hover:text-habari-gold transition-colors">Annuaire économique</Link></li>
              <li><Link href="/investisseurs" className="text-white/60 hover:text-habari-gold transition-colors">Espace investisseurs</Link></li>
              <li><Link href="/appels-offres" className="text-white/60 hover:text-habari-gold transition-colors">Appels d'offres</Link></li>
              <li><Link href="/evenements" className="text-white/60 hover:text-habari-gold transition-colors">Événements</Link></li>
              <li><Link href="/abonnements" className="text-white/60 hover:text-habari-gold transition-colors">Abonnements</Link></li>
              <li><Link href="/archives" className="text-white/60 hover:text-habari-gold transition-colors">Archives</Link></li>
              <li><Link href="/telecharger" className="text-white/60 hover:text-habari-gold transition-colors">Télécharger le magazine</Link></li>
              <li><Link href="/a-propos" className="text-white/60 hover:text-habari-gold transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-5 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {get("contact_email", "redaction@habari.info") && (
                <li><a href={`mailto:${get("contact_email", "redaction@habari.info")}`} className="hover:text-habari-gold transition-colors">{get("contact_email", "redaction@habari.info")}</a></li>
              )}
              <li><a href="mailto:publicite@habari.info" className="hover:text-habari-gold transition-colors">publicite@habari.info</a></li>
              <li className="pt-2">
                <span className="text-white/40 text-xs">Éditeur</span><br />
                Groupe Sixième Sens<br />
                <a href="https://www.sixiemesens.agency" target="_blank" rel="noopener noreferrer" className="text-habari-gold hover:underline text-xs">
                  www.sixiemesens.agency
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter strip */}
      <div className="border-t border-white/10">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-serif font-bold text-white text-sm">Newsletter gratuite</p>
              <p className="text-xs text-white/50 mt-0.5">Résumé hebdomadaire de l'actualité économique de l'Afrique centrale.</p>
            </div>
            {nlDone ? (
              <p className="text-xs text-habari-gold font-sans">✓ Inscription confirmée !</p>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); if (nlEmail) subscribeMutation.mutate({ email: nlEmail, tier: "free" }); }}
                className="flex gap-2 w-full md:w-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="votre@email.com"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  className="flex-1 md:w-56 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-habari-gold/50"
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="px-4 py-2 rounded-md bg-habari-gold text-[oklch(0.15_0.02_250)] text-sm font-sans font-semibold hover:bg-habari-gold/90 transition-colors shrink-0"
                >
                  {subscribeMutation.isPending ? "…" : "S'inscrire"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {get("site_name", "Habari Magazine")} — Tous droits réservés
          </p>
          <div className="flex items-center gap-3">
            {get("social_twitter") && (
              <a href={get("social_twitter")} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-habari-gold transition-colors text-xs">Twitter</a>
            )}
            {get("social_facebook") && (
              <a href={get("social_facebook")} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-habari-gold transition-colors text-xs">Facebook</a>
            )}
            {get("social_linkedin") && (
              <a href={get("social_linkedin")} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-habari-gold transition-colors text-xs">LinkedIn</a>
            )}
            {get("social_instagram") && (
              <a href={get("social_instagram")} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-habari-gold transition-colors text-xs">Instagram</a>
            )}
            {get("social_youtube") && (
              <a href={get("social_youtube")} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-habari-gold transition-colors text-xs">YouTube</a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
