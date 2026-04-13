import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.20_0.02_250)] text-white/80">
      {/* Main footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/IqKMUVQDBqpAxFCo.png"
                alt="HM"
                className="h-10 w-auto"
              />
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663347570863/sbAbNdCDbWTYdcyx.png"
                alt="HABARI MAG"
                className="h-6 w-auto"
              />
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Connexion économique pour l'intégration de l'Afrique Centrale. Comprendre, décider, investir, agir.
            </p>
            <div className="habari-separator !bg-[oklch(0.72_0.15_75)] !w-16"></div>
            <p className="text-xs text-white/40 mt-4">
              Une publication du Groupe Sixième Sens
            </p>
          </div>

          {/* Rubriques */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-5 uppercase tracking-wider">Rubriques</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/magazine" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Éditorial</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Dossier Central</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Interviews</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Business &amp; Innovation</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Analyse Pays</Link></li>
              <li><Link href="/magazine" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Culture &amp; Société</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-5 uppercase tracking-wider">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/annuaire" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Annuaire économique</Link></li>
              <li><Link href="/investisseurs" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Espace investisseurs</Link></li>
              <li><Link href="/appels-offres" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Appels d'offres</Link></li>
              <li><Link href="/evenements" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Événements</Link></li>
              <li><Link href="/abonnements" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Abonnements</Link></li>
              <li><Link href="/archives" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Archives</Link></li>
              <li><Link href="/telecharger" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">Télécharger le magazine</Link></li>
              <li><Link href="/a-propos" className="text-white/60 hover:text-[oklch(0.72_0.15_75)] transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-white text-sm mb-5 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><a href="mailto:redaction@habari.info" className="hover:text-[oklch(0.72_0.15_75)] transition-colors">redaction@habari.info</a></li>
              <li><a href="mailto:publicite@habari.info" className="hover:text-[oklch(0.72_0.15_75)] transition-colors">publicite@habari.info</a></li>
              <li className="pt-2">
                <span className="text-white/40 text-xs">Éditeur</span><br />
                Groupe Sixième Sens<br />
                <a href="https://www.sixiemesens.agency" target="_blank" rel="noopener noreferrer" className="text-[oklch(0.72_0.15_75)] hover:underline text-xs">
                  www.sixiemesens.agency
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Habari Magazine — Tous droits réservés
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="#" className="hover:text-white/60 transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white/60 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white/60 transition-colors">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
