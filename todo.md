# Habari Magazine - Project TODO

## Phase 1: Base de données et modèle de données
- [x] Créer tables pour articles, auteurs, catégories
- [x] Créer tables pour annuaire des acteurs économiques
- [x] Créer tables pour opportunités d'investissement
- [x] Créer tables pour appels d'offres
- [x] Créer tables pour abonnements et plans
- [x] Créer tables pour événements et formations
- [x] Créer tables pour messagerie interne
- [x] Créer tables pour alertes personnalisées
- [x] Configurer migrations et relations

## Phase 2: Pages principales et navigation
- [x] Page d'accueil avec tableau de bord économique
- [x] Navigation principale avec menu
- [x] Page Magazine (liste des articles)
- [x] Page Article détaillée avec data visualisation
- [x] Page Annuaire avec recherche et filtres
- [x] Page Investisseurs avec opportunités
- [x] Page Appels d'offres
- [x] Page Événements et formations
- [x] Page Abonnements avec plans tarifaires
- [x] Page Espace membre (tableau de bord)

## Phase 3: Fonctionnalités Magazine
- [x] Affichage des articles avec filtres par pays CEMAC
- [x] Système de catégorisation (analyses, dossiers, interviews)
- [x] Pagination et chargement des articles
- [x] Intégration de data visualisation sur pages article
- [ ] Système de commentaires/réactions

## Phase 4: Annuaire et Networking
- [x] Affichage de l'annuaire des acteurs
- [x] Recherche avancée avec filtres (secteur, pays, type)
- [ ] Profils détaillés des acteurs
- [ ] Système de mise en relation/contact

## Phase 5: Système d'investissement
- [x] Affichage des opportunités d'investissement
- [ ] Formulaire de candidature pour investisseurs
- [ ] Système de gestion des deals
- [ ] Notifications pour nouvelles opportunités

## Phase 6: Abonnements et accès
- [x] Système de trois niveaux d'abonnement (Standard, Premium, Entreprise)
- [ ] Gestion des paiements
- [ ] Contrôle d'accès basé sur l'abonnement
- [ ] Gestion des renouvellements

## Phase 7: Espace membre
- [x] Tableau de bord personnalisé
- [ ] Messagerie interne entre membres
- [ ] Système d'alertes personnalisées
- [x] Gestion du profil utilisateur
- [ ] Historique des lectures/consultations

## Phase 8: Moteur de recherche
- [x] Recherche globale (articles + annuaire)
- [x] Filtres avancés
- [ ] Autocomplete et suggestions
- [ ] Historique de recherche

## Phase 9: Optimisations et tests
- [x] Tests unitaires des fonctionnalités clés
- [ ] Optimisation des performances
- [x] Responsive design et mobile
- [ ] SEO et métadonnées
- [ ] Tests de sécurité

## Phase 10: Déploiement
- [ ] Checkpoint final
- [ ] Présentation au client
- [x] 35 tests unitaires passent (features + auth + newsletter + access levels + admin)

## Phase 11: Refonte graphique basée sur les documents Habari
- [x] Appliquer la charte graphique officielle (bleu #1565A0 + ocre #D4A017)
- [x] Intégrer la typographie Playfair Display (titres) + Source Sans Pro (corps)
- [x] Refondre la page d'accueil avec design magazine premium
- [x] Créer la page article détaillée avec mise en page magazine
- [x] Intégrer le contenu réel du Numéro 0 et pré-sommaire Numéro 1
- [x] Ajouter les rubriques officielles (Éditorial, Dossier Central, Interview, Business & Innovation, Analyse Pays, Culture & Société)
- [x] Créer le Baromètre CEMAC avec data visualisation
- [x] Implémenter le design des encadrés (Chiffres clés, En résumé)
- [x] Ajouter le footer avec mentions Groupe Sixième Sens
- [x] Optimiser la navigation pour refléter la structure du magazine

## Phase 12: Refonte vitrine premium
- [x] Restructurer le contenu : accès libre (baromètre, 2-3 articles, agenda) vs premium (dossiers, archives, analyses pays, tribunes)
- [x] Ajouter champ accessLevel (free/premium) aux articles dans le schéma DB
- [x] Implémenter le contrôle d'accès premium sur les articles
- [x] Refondre la page d'accueil en vitrine premium (pas site d'actualités généraliste)
- [x] Créer le système de newsletter à deux niveaux (Gratuite 0€ + Premium 15-25€/mois)
- [x] Ajouter table newsletter_subscribers dans la DB
- [x] Créer la page d'inscription newsletter avec les deux formules
- [x] Intégrer les badges libre/premium sur les articles
- [x] Adapter la fréquence de contenu : 2-4 contenus/mois + baromètre mensuel
- [x] Revoir les plans d'abonnement (Gratuite + Premium newsletter)
- [x] Ajouter un paywall élégant pour le contenu premium
- [ ] Créer une section "Archives" pour les abonnés premium
- [x] Revoir le design global pour un positionnement plus premium/institutionnel
- [x] Tests unitaires : 21 tests passent (features + auth + newsletter + access levels)

## Phase 13: Panneau d'administration
- [x] Layout admin avec sidebar (DashboardLayout) et protection par rôle admin
- [x] Dashboard admin avec statistiques (articles, utilisateurs, abonnés newsletter)
- [x] CRUD articles : liste, création, édition, suppression, publication/dépublication
- [x] Gestion accès libre/premium sur les articles
- [x] Éditeur d'articles avec champs titre, contenu, extrait, rubrique, pays, image
- [x] Gestion des utilisateurs : liste, modification des rôles, détails
- [x] Gestion des abonnés newsletter : liste, filtres par tier
- [x] Procédures tRPC admin protégées (adminProcedure)
- [x] Routes admin dans App.tsx avec protection d'accès
- [x] Tests unitaires pour les procédures admin (35 tests passent)

## Phase 14: Mise à jour signature
- [x] Remplacer "Habari - Afrique Centrale" par "Habari = plateforme de connexion économique pour l'intégration CEMAC" sur tout le site

## Phase 15: Partage réseaux sociaux
- [x] Créer un composant SocialShare réutilisable (Facebook, Twitter/X, LinkedIn, WhatsApp, copie de lien)
- [x] Intégrer le partage dans la page ArticlePage (barre complète haut + bas)
- [x] Ajouter des boutons de partage compacts sur les cartes d'articles (page Magazine et Home)
- [x] Ajouter les meta tags Open Graph et Twitter Card pour un aperçu riche lors du partage
- [x] Notification toast lors de la copie du lien
- [x] Icônes SVG légères sans dépendance externe
- [x] 35 tests unitaires passent

## Phase 16: Page À propos
- [x] Créer la page About.tsx avec mission, vision, valeurs de Habari
- [x] Section équipe éditoriale avec portraits et rôles (6 membres)
- [x] Section Groupe Sixième Sens (maison mère) avec 4 domaines d'expertise
- [x] Section partenaires et institutions CEMAC (CEMAC, BEAC, BDEAC, FMI, BAD, BM)
- [x] Section timeline / jalons de Habari
- [x] Section CTA contact rédaction
- [x] Intégrer la page dans la navigation (Footer)
- [x] Ajouter la route /a-propos dans App.tsx
- [x] Design cohérent avec la charte graphique Habari
- [x] 35 tests unitaires passent

## Phase 17: Formulaire de contact
- [x] Créer la table contact_messages dans le schéma DB avec catégories et statuts
- [x] Ajouter les helpers DB pour les messages de contact (submit, list, byId, updateStatus, countNew, delete)
- [x] Créer les procédures tRPC (publique contact.submit + admin contact.list/byId/updateStatus/countNew/delete)
- [x] Intégrer le formulaire de contact dans la page À propos (nom, email, catégorie, sujet, message)
- [x] Créer la page admin /admin/messages avec liste, filtres, vue détaillée, actions
- [x] Lien Messages ajouté dans le sidebar admin
- [ ] Notification au propriétaire lors de la réception d'un message
- [x] Tests unitaires : 43 tests passent (dont 8 nouveaux pour contact)

## Phase 18: Mise à jour des contacts
- [x] Remplacer les adresses email par publicite@habari.info et redaction@habari.info sur tout le site (Footer + About)

## Phase 19: Intégration Stripe
- [x] Configurer Stripe via webdev_add_feature
- [x] Clés API Stripe automatiquement injectées
- [x] Créer products.ts avec 3 produits (Premium 25€, Newsletter 15€, Bundle 35€) mensuel/annuel
- [x] Créer stripe.ts avec helpers checkout/session/cancel
- [x] Créer webhook.ts pour gérer les événements Stripe (checkout.session.completed, invoice.paid, subscription events)
- [x] Enregistrer le webhook AVANT express.json() dans index.ts
- [x] Ajouter champs Stripe au schéma DB (stripeCustomerId, stripeSubscriptionId)
- [x] Procédures tRPC stripe (products, createCheckout, getSession, cancelSubscription)
- [x] Refondre page Abonnements avec boutons Stripe et toggle mensuel/annuel
- [x] Section newsletter avec formulaire gratuit + paiement premium
- [x] Bannière de succès après paiement (session_id)
- [x] FAQ mise à jour avec informations paiement
- [x] 43 tests unitaires passent

## Phase 20: Prix, Mon compte, CEEAC
- [x] Modifier le prix Premium de 25€/mois à 10€/mois (100€/an)
- [x] Ajuster les prix du Bundle Intégral : 20€/mois (200€/an)
- [x] Créer la page "Mon compte" (/mon-compte) avec gestion d'abonnement Stripe
- [x] Gestion du profil utilisateur dans Mon compte
- [x] Annulation d'abonnement Stripe depuis Mon compte
- [x] Préférences de notifications dans Mon compte
- [x] Activité récente dans Mon compte
- [x] Bouton Mon compte dans la Navbar (desktop + mobile)
- [x] Remplacer CEMAC par CEEAC sur tout le site (client + server + tests)
- [x] Mettre à jour la zone d'intervention : Afrique Centrale (CEEAC)
- [x] Ajouter la route /mon-compte dans App.tsx
- [x] 43 tests unitaires passent

## Phase 21: Ajout des pays CEEAC manquants
- [x] Ajouter les pays CEEAC manquants au schéma de base de données (Angola, Burundi, RDC, Rwanda, São Tomé-et-Príncipe)
- [x] Mettre à jour les filtres par pays sur toutes les pages (Magazine, Annuaire, Investisseurs, Appels d'offres, Événements)
- [x] Mettre à jour la page d'accueil (baromètre CEEAC) avec les 11 pays
- [x] Mettre à jour la page À propos avec les 11 pays CEEAC
- [x] Mettre à jour les tests unitaires pour couvrir les 11 pays CEEAC

## Phase 22: Fusion boutons Mon compte / Mon espace
- [x] Fusionner les boutons "Mon compte" et "Mon espace" en un seul bouton "Mon espace"
- [x] Rediriger vers login si non connecté, vers /mon-compte si connecté

## Phase 23: Correction CEMAC/CEEAC + Articles + Images d'illustration
- [x] Corriger le dossier central : c'est la CEMAC (pas CEEAC) qui est en panne sèche
- [x] Intégrer l'article complet "Panne sèche à la CEMAC" avec contenu réel
- [x] Intégrer l'article "Gabon : Oligui Nguema face au mur de l'argent"
- [x] Intégrer l'article "La CEEAC face au paradoxe vert"
- [x] Générer et ajouter des images d'illustration sur le hero, les articles et les pages principales
- [x] Améliorer l'esthétique globale avec des visuels

## Phase 24: Espace téléchargement magazine PDF
- [x] Uploader le PDF du magazine N°000 sur S3
- [x] Extraire la couverture du PDF comme image d'illustration
- [x] Créer une section téléchargement sur la page d'accueil
- [x] Créer une page dédiée /telecharger avec la liste des numéros disponibles
- [x] Ajouter le lien dans la navigation

## Phase 25: Restriction téléchargement premium
- [x] Analyser le système d'abonnement Stripe existant (schéma DB, procédures)
- [x] Créer une procédure tRPC magazine.checkAccess pour vérifier l'accès premium
- [x] Mettre à jour la page /telecharger avec badges gratuit/premium et paywall
- [x] Mettre à jour la section téléchargement sur la page d'accueil
- [x] Écrire les tests unitaires pour la vérification d'accès premium (10 tests)

## Phase 26: Photos rubrique Culture & Société
- [x] Uploader les deux photos (concert + portrait) sur S3
- [x] Intégrer les photos dans la rubrique Culture & Société sur la page d'accueil, Magazine et ArticlePage

## Phase 27: Ajout de 3 événements
- [x] Ajouter PME-Bright Forum — N'Djamena, Tchad (Novembre 2026)
- [x] Ajouter Cultur'Com — Ouagadougou, Burkina Faso (26 Février 2026)
- [x] Ajouter Petit-déjeuner décideurs CEEAC — Kinshasa, RDC

## Phase 28: Période de lancement — accès premium gratuit pour les inscrits jusqu'au 1er juin 2026
- [x] Modifier la logique backend magazine.checkAccess pour accorder l'accès premium aux inscrits avant le 1er juin 2026
- [x] Mettre à jour le frontend Downloads pour afficher la promotion de lancement
- [x] Mettre à jour le frontend des articles premium pour refléter l'accès gratuit temporaire
- [x] Ajouter une bannière/badge "Offre de lancement" visible sur le site
- [x] Mettre à jour les tests unitaires pour couvrir la période de lancement (56 tests passent)

## Phase 29: Mise à jour rubrique Culture — Article Akendengué
- [x] Mettre à jour l'article Akendengué dans ArticlePage.tsx avec le contenu complet du document
- [x] Mettre à jour le titre, l'auteur et l'extrait sur Home.tsx et Magazine.tsx
- [x] Vérifier la cohérence sur toutes les pages

## Phase 30: CRUD admin numéros PDF
- [x] Créer table magazine_issues dans le schéma DB (titre, numéro, date, description, pdfUrl, coverUrl, isPremium, sommaire)
- [x] Créer helpers DB pour les numéros (create, list, byId, update, delete)
- [x] Créer procédures tRPC admin (magazineIssues.create, list, byId, update, delete)
- [x] Créer endpoint upload PDF/image vers S3
- [x] Créer page admin /admin/magazine avec liste, création, édition, suppression
- [x] Mettre à jour la page /telecharger pour utiliser les données dynamiques de la DB

## Phase 31: Email de bienvenue automatique
- [x] Créer template email de bienvenue avec info offre de lancement
- [x] Envoyer automatiquement l'email après inscription (callback OAuth)
- [x] Inclure les contenus disponibles et l'offre de lancement dans l'email

## Phase 32: Compteur d'inscrits dans le dashboard admin
- [x] Ajouter le compteur d'inscrits dans les stats du dashboard admin
- [x] Afficher le nombre total d'utilisateurs inscrits dans le panneau admin + stats magazine (numéros, téléchargements)

## Phase 33: Section Archives des numéros passés
- [x] Créer procédure tRPC archives avec filtrage par rubrique et année
- [x] Créer la page /archives avec grille de numéros et filtres
- [x] Ajouter les filtres par rubrique (Dossier Central, Analyse Pays, Interview, Business & Innovation, Culture & Société, Éditorial)
- [x] Ajouter le filtre par année
- [x] Intégrer la page dans la navigation (Navbar + Footer)
- [x] Ajouter la route dans App.tsx
- [x] Écrire les tests unitaires (9 tests archives, 72 tests au total)

## Phase 34: Interview Dr Guy Gweth — La Grande Interview CEMAC
- [x] Uploader les deux photos de Dr Guy Gweth sur S3
- [x] Intégrer l'article interview complet dans ArticlePage.tsx
- [x] Mettre à jour Home.tsx et Magazine.tsx avec l'extrait de l'interview
- [x] Vérifier la cohérence sur toutes les pages

## Phase 35: Recadrage photo Dr Guy Gweth
- [x] Recadrer la photo portrait de Dr Guy Gweth pour un meilleur rendu dans l'article
- [x] Uploader la photo recadrée sur S3 et mettre à jour les URLs

## Phase 36: Fiche d'inscription complète avec promotion
- [x] Ajouter champs profil utilisateur au schéma DB (firstName, lastName, phone, function, organization)
- [x] Créer procédure tRPC pour compléter le profil utilisateur (updateProfile)
- [x] Créer page/modale de fiche d'inscription (Nom, Prénom, Email, WhatsApp, Fonction, Entreprise/Organisation)
- [x] Relier le bouton "S'inscrire gratuitement" au formulaire d'inscription
- [x] Afficher la promotion accès gratuit jusqu'au 1er juin 2026 sur le formulaire
- [x] Rediriger vers le formulaire après inscription OAuth si profil incomplet
- [x] Écrire les tests unitaires pour les nouvelles procédures

## Phase 37: Amélioration page Mon compte — Affichage et modification du profil
- [x] Afficher les informations de profil complètes sur la page Mon compte
- [x] Permettre la modification des champs (Nom, Prénom, Email, WhatsApp, Fonction, Organisation, Pays, Secteur)
- [x] Ajouter un mode édition avec sauvegarde et annulation
- [x] Gérer les états de chargement et les messages de succès/erreur
- [x] Vérifier les tests unitaires existants et en ajouter si nécessaire

## Phase 38: HABARI GREEN — Section économie verte
- [x] Créer la page principale /green (hub économie verte)
- [x] Créer la sous-page /green/carbone (Dashboard carbone : prix crédits, projets REDD+, deals, réglementation)
- [x] Créer la sous-page /green/forets (Forêts & biodiversité COMIFAC)
- [x] Créer la sous-page /green/energie (Transition énergétique)
- [x] Créer la sous-page /green/finance (Finance verte & fonds climat)
- [x] Créer la sous-page /green/acteurs (Annuaire acteurs verts)
- [x] Créer la sous-page /green/ressources (Guides, rapports, outils)
- [x] Ajouter GREEN dans le menu principal de la Navbar avec méga-menu
- [x] Ajouter le bloc Habari Green sur la page d'accueil (widget économie verte)
- [x] Enregistrer les routes /green/* dans App.tsx
- [x] Tests existants passent (83 tests)

## Phase 39: Suppression badge + Dossier Économie Verte
- [x] Supprimer la mention "Nouvelle rubrique" sur la page HABARI GREEN (/green et Home.tsx)
- [x] Intégrer le dossier "L'économie verte, nouvelle doctrine de compétitivité pour l'Afrique Centrale" comme article complet dans ArticlePage.tsx
- [x] Ajouter le dossier en vedette sur la page /green (section dédiée entre indicateurs et sous-rubriques)
- [x] Ajouter le dossier dans la liste des articles du Magazine avec catégorie "Habari Green"
- [x] Ajouter le dossier dans les articles suggérés en bas des autres articles
- [x] 83 tests unitaires passent

## Phase 40: Article Emplois Verts CEEAC
- [x] Trouver/uploader deux images d'illustration pour l'article (panneaux solaires + aquaculture)
- [x] Ajouter l'article complet dans ArticlePage.tsx (slug: emplois-verts-ceeac) avec 4 chapitres, tableau, blockquote, images
- [x] Ajouter l'article dans la liste du Magazine.tsx (catégorie Business & Innovation)
- [x] Ajouter l'article sur la page /green comme deuxième dossier en vedette
- [x] Ajouter l'article dans les suggestions "À lire également" et la section "En résumé"
- [x] 83 tests unitaires passent

## Phase 41: Mise à jour Événements — 6 nouveaux événements internationaux
- [x] Ajouter Sommet de la Ligue des États Arabes (fin mars 2026, Alger, Algérie)
- [x] Ajouter Réunion Ministérielle du G20 Finances (mars 2026, États-Unis)
- [x] Ajouter Sommet ASEAN-Australie (mars 2026, à confirmer)
- [x] Ajouter OMC MC14 (26-29 mars 2026, Yaoundé, Cameroun)
- [x] Ajouter Sommet Afrique-France "Africa Forward" (11-12 mai 2026, Nairobi, Kenya)
- [x] Ajouter Trade and Sustainability Hub en marge OMC MC14 (mars 2026, Yaoundé, Cameroun)
- [x] Vérifier le rendu et les tests (79/83 passent, 4 timeouts DB intermittents)

## Phase 42: Mise à jour logo et tagline
- [x] Uploader le nouveau logo HABARI MAG sur le CDN
- [x] Mettre à jour le logo dans la Navbar avec le nouveau bloc logo
- [x] Mettre à jour la tagline "Connexion économique pour l'intégration de l'Afrique Centrale"
- [x] Mettre à jour le logo dans le Footer
- [x] Mettre à jour le logo dans la page d'accueil et autres pages si nécessaire
- [x] Mettre à jour le favicon et VITE_APP_LOGO (VITE_APP_TITLE non modifiable en built-in)
- [x] Vérifier le rendu et les tests

## Phase 43: Correction logo — Remplacement par logoHABARIV4.jpg
- [x] Uploader logoHABARIV4.jpg sur le CDN
- [x] Mettre à jour l'URL du logo dans Navbar.tsx
- [x] Mettre à jour l'URL du logo dans Footer.tsx
- [x] Vérifier le rendu

## Phase 44: Mise à jour logo — Icône HM + Texte HABARI MAG séparés
- [x] Uploader ICONHABARI1.png (monogramme HM) et ICONHABARI2.png (texte HABARI MAG) sur le CDN
- [x] Mettre à jour le logo dans Navbar.tsx avec icône HM + texte HABARI MAG + tagline
- [x] Mettre à jour le logo dans Footer.tsx
- [x] Vérifier le rendu sur fond sombre

## Phase 45: Mise à jour logo — ICONHABARI3 + ICONHABARI4 (fond blanc)
- [x] Uploader ICONHABARI3.png et ICONHABARI4.png sur le CDN
- [x] Mettre à jour le logo dans Navbar.tsx
- [x] Mettre à jour le logo dans Footer.tsx
- [x] Vérifier le rendu

## Phase 46: Logos fond noir + nouvelle tagline complète
- [x] Uploader ICONHABARI1.png (HM fond noir) et ICONHABARI2.png (texte fond noir) sur le CDN
- [x] Mettre à jour le logo dans Navbar.tsx avec les versions fond noir
- [x] Mettre à jour le logo dans Footer.tsx avec les versions fond noir
- [x] Remplacer la tagline partout par : "Connexion économique pour l'intégration de l'Afrique Centrale. Comprendre, décider, investir, agir."
- [x] Supprimer "(CEEAC)" de la tagline
- [x] Vérifier le rendu

## Phase 47: Logos fond blanc/noir + Interview Loïc Mackosso
- [x] Navbar : logo fond blanc (ICONHABARI3 + ICONHABARI4) sur background blanc
- [x] Footer : logo fond noir (ICONHABARI1 + ICONHABARI2) sur background noir
- [x] Intégrer l'article interview Loïc Mackosso dans ArticlePage.tsx
- [x] Ajouter l'article dans Magazine.tsx et Home.tsx
- [x] Ajouter l'article dans les articles suggérés
- [x] Vérifier les tests (83 tests passent)

## Phase 48: Article court Habari Green — Cobalt & Minerais Verts
- [x] Lire le document source DOCX
- [x] Rechercher et uploader des illustrations sur le CDN
- [x] Ajouter l'article court (3-5 min) dans ArticlePage.tsx
- [x] Ajouter dans Magazine.tsx
- [x] Ajouter dans Home.tsx
- [x] Vérifier les tests et le rendu (83 tests passent)
- [x] Sauvegarder le checkpoint

## Phase 49: Recadrer et recentrer la photo de Loïc Mackosso
- [x] Analyser la photo actuelle
- [x] Recadrer et recentrer sur le visage
- [x] Uploader la nouvelle image sur le CDN
- [x] Mettre à jour les références dans le site (ArticlePage, Magazine, Home)
- [x] Vérifier le rendu (83 tests passent)

## Phase 50: Article court Habari Green — Villes Africaines & Défi Climatique
- [x] Lire le document source DOCX
- [x] Rechercher et uploader des illustrations sur le CDN (ville africaine, BRT Dakar, ville durable)
- [x] Ajouter l'article court (4 min) dans ArticlePage.tsx
- [x] Ajouter dans Magazine.tsx
- [x] Ajouter dans Home.tsx
- [x] Vérifier les tests et le rendu (83 tests passent)
- [x] Sauvegarder le checkpoint

## Phase 51: Mise à jour logo Habari — fond transparent
- [x] Analyser le logo fourni (logoHABARI.png) — fond noir supprimé, rendu transparent
- [x] Uploader le logo sur le CDN
- [x] Mettre à jour la Navbar avec le nouveau logo transparent
- [x] Mettre à jour le Footer avec le nouveau logo + filtre brightness CSS
- [x] Vérifier le rendu sur fond clair (Navbar) et fond sombre (Footer) — OK
- [x] Sauvegarder le checkpoint (83 tests passent)

## Phase 52: Corriger le positionnement des photos de portrait
- [x] Corriger object-position dans ArticlePage.tsx (hero image + miniatures)
- [x] Corriger object-position dans Home.tsx (cartes free + premium)
- [x] Corriger object-position dans Magazine.tsx (cartes DB + sample)
- [x] Vérifier le rendu — visages Mackosso et Gweth visibles en entier
- [x] Sauvegarder le checkpoint (83 tests passent)

## Phase 53: Améliorer les boutons de partage réseaux sociaux
- [x] Analyser les boutons de partage existants (SocialShare component)
- [x] Améliorer le composant SocialShare : ajout Telegram, Email, variante sticky
- [x] Vérifier la présence des boutons dans ArticlePage (haut + bas d'article)
- [x] Ajouter barre de partage flottante/sticky sur le côté gauche (desktop)
- [x] Ajouter les meta tags Open Graph dynamiques par article (react-helmet-async)
- [x] Vérifier le rendu et les tests (83 tests passent)
- [x] Sauvegarder le checkpoint

## Phase 54: Article court Culture et Société - Femmes entrepreneuses
- [x] Lire le document source DOCX
- [x] Rechercher et uploader des illustrations sur le CDN (AWIEF, RDC, tech)
- [x] Rédiger l'article court percutant (4 min) dans ArticlePage.tsx
- [x] Ajouter dans Magazine.tsx
- [x] Ajouter dans Home.tsx
- [x] Vérifier les tests et le rendu (83 tests passent)
- [x] Sauvegarder le checkpoint

## Phase 55: Article Culture & Société - Révolution du Mobile Money (1200-1300 mots)
- [x] Lire le document source DOCX
- [x] Rechercher et uploader des illustrations sur le CDN (M-Pesa, femme marché, kiosque)
- [x] Rédiger l'article (1200-1300 mots) avec encadré chiffré DATA dans ArticlePage.tsx
- [x] Ajouter dans Magazine.tsx
- [x] Ajouter dans Home.tsx
- [x] Vérifier les tests et le rendu (83 tests passent)
- [x] Sauvegarder le checkpoint

## Phase 56: Revue site Habari Mag - Recommandations ABT

### 56a. Refonte Hero page d'accueil
- [x] Passer le hero en fond clair (pas sombre)
- [x] Créer une bande défilante interactive avec articles chauds / derniers dossiers
- [x] Style Forbes Afrique (défilement bullets points)

### 56b. Réorganisation sections page d'accueil
- [x] Ordre : Prez & Téléchargement Mag → Articles du N° → Green → Contenu Premium → Abonnements → Events → Écosystème Habari → Footer

### 56c. Section Abonnements renommée
- [x] Changer "La newsletter Habari" par "Votre Accès Habari"
- [x] Changer "Newsletter Gratuite" par "Accès Gratuit"
- [x] Changer "Newsletter Premium" par "Accès Premium"
- [x] Rendre les boxes redirectionnelles vers /abonnements
- [x] Garder la lucarne email pour inscription gratuite NL

### 56d. Baromètre mensuel
- [x] Retirer le baromètre de la page d'accueil
- [x] Ajouter le baromètre dans l'onglet Investisseurs (6 indicateurs)

### 56e. Sous-rubriques Magazine
- [x] Chaque sous-rubrique redirige vers son contenu respectif (pas toutes vers "Tous")
- [x] Rajouter la sous-rubrique Green dans le listing des rubriques Magazine

### 56f. Onglet Appels d'offres enrichi
- [x] Ajouter les AMI (Appels à Manifestation d'Intérêt)
- [x] Ajouter les appels à candidatures / offres d'emploi

### 56g. Nouvel onglet contenus externes
- [x] Créer un onglet entre Événements et Archives pour les contenus externes
- [x] Communiqués de presse, communications publiques, messages sponsorisés
- [x] Nom : "Partenaires" (page créée avec 3 catégories)

### 56h. Révision structure pricing
- [x] Corriger : NL premium ne doit pas coûter plus cher que accès premium site
- [x] Revoir les prix, casser en 2-3 paliers
- [x] Conserver formule Intégral et formules annuelles
- [x] Ajouter tarif magazine PDF (4,99€ barré 9,99€)
- [ ] Corriger le bug clic-droit sur les boutons s'abonner (à investiguer)

### 56i. Aperçu articles
- [x] S'assurer que tous les articles affichent bien un aperçu

### 56j. Tarif magazine PDF
- [x] Inscrire un prix/tarif d'accès au mag papier en téléchargement (4,99€ barré 9,99€)
- [x] Montrer l'économie réalisée en s'inscrivant (effet psychologique)

## Phase 57: Recherche avancée articles
- [x] Analyser la structure actuelle des articles (sampleArticles + DB)
- [x] Créer la page /recherche (Search.tsx) avec filtres avancés (catégorie, auteur, date, accès)
- [x] Barre de recherche plein texte (titre, extrait, auteur, rubrique)
- [x] 4 filtres dropdown : Catégorie, Auteur, Période, Accès
- [x] Tags de filtres actifs avec suppression individuelle
- [x] Tri par pertinence, date, temps de lecture
- [x] Compteur de résultats dynamique
- [x] État vide avec message et bouton "Effacer tous les filtres"
- [x] Ajouter l'icône de recherche (loupe) dans la Navbar (desktop + mobile)
- [x] Ajouter la route /recherche dans App.tsx
- [x] Support du paramètre URL ?q= pour recherche depuis d'autres pages
- [x] Écrire 33 tests Vitest pour la logique de filtrage (search.test.ts)
- [x] Vérifier les tests et le rendu (116 tests passent, 0 erreurs TypeScript)
- [x] Sauvegarder le checkpoint

## Phase 58: Mise à jour Appels d'offres — ANSER RDC Fonds Mwinda
- [x] Consulter le lien LinkedIn ANSER RDC et extraire les informations
- [x] Analyser la structure actuelle des appels d'offres dans le site
- [x] Intégrer l'annonce ANSER RDC Fonds Mwinda dans l'onglet AMI/Partenariats (en position « À la une »)
- [x] Ajouter description complète, partenaires (GEAPP, GreenMax, Banque Mondiale), webinaire (17 mars), lien LinkedIn
- [x] Vérifier le rendu et les tests (116 tests passent)
- [x] Sauvegarder le checkpoint

## Phase 59: Mise à jour complète — Revue DOCX + Appel d'offres + Pricing
- [x] Consulter lien arzikinhaske.com et extraire l'appel à candidature G4-A1
- [x] Ajouter l'appel Arzikin HASKE G4-A1 dans l'onglet AMI/Partenariats (badge « Nouveau — À la une »)
- [x] Mettre à jour le pricing : Premium 4,50€/mois, Intégral 9€/mois (MEILLEURE OFFRE), Newsletter 5€/mois
- [x] Mettre à jour les prix dans products.ts (serveur Stripe)
- [x] Mettre à jour les prix dans Home.tsx, MyAccount.tsx, Subscriptions.tsx
- [x] Ajouter la bande défilante « Les + lus » (style Forbes) entre le hero et les articles
- [x] Animation marquee CSS ajoutée dans index.css
- [x] Ajouter rubrique Habari Green dans le footer (colonne Rubriques)
- [x] Liens de rubriques du footer avec paramètres de filtrage (?rubrique=...)
- [x] Tests : 116 tests passent, 0 erreur TypeScript
- [x] Sauvegarder le checkpoint

## Phase 60: Formulaire admin CRUD Appels d'offres / AMI / Emplois
- [x] Analyser la structure existante (schéma DB, données en dur Bids.tsx, pages admin, AdminLayout)
- [x] Créer la table DB unifiée `opportunities` (type: bid/ami/job) + migration
- [x] Créer les helpers DB CRUD dans server/db.ts (getActive, bySlug, counts, adminList, adminById, adminCreate, adminUpdate, adminDelete, adminToggleFeatured)
- [x] Créer les procédures tRPC admin (admin.opportunities: list, byId, create, update, delete, toggleFeatured)
- [x] Créer les procédures tRPC publiques (opportunities: list, bySlug, counts)
- [x] Créer la page admin /admin/opportunites (AdminOpportunities.tsx) avec liste, filtres par type/statut, recherche, actions
- [x] Créer le formulaire de création/édition (AdminOpportunityForm.tsx) avec tous les champs (titre, organisme, pays, date limite, budget, description, type, secteur, statut, featured, lien externe, partenaires, webinaire, type contrat, niveau expérience)
- [x] Ajouter le lien « Opportunités » dans le sidebar admin (AdminLayout.tsx) avec icône Megaphone
- [x] Ajouter les routes /admin/opportunites, /admin/opportunites/nouveau, /admin/opportunites/:id dans App.tsx
- [x] Adapter la page publique Bids.tsx pour lire depuis la DB via tRPC (fallback données en dur)
- [x] Écrire 19 tests Vitest pour les procédures CRUD (opportunities.test.ts)
- [x] Tous les 135 tests passent, 0 erreur TypeScript
- [x] Sauvegarder le checkpoint

## Phase 61: Corrections régressions — Restaurer indicateurs CEEAC, données appels d'offres, liens
- [x] Restaurer les données en dur (sampleBids, sampleAMI, sampleJobs) sur la page publique Bids.tsx (nettoyage données test DB)
- [x] Corriger le fallback DB → données en dur pour que les 3 onglets affichent du contenu
- [x] Créer le sous-onglet « Indicateurs économiques CEEAC » par pays dans la page Investisseurs
- [x] Tableau complet 11 pays (RDC, Angola, Cameroun, Gabon, Tchad, Congo, Guinée Éq., Rwanda, Burundi, RCA, São Tomé) avec PIB, Croissance, Inflation, Population
- [x] Sélecteur principal « Deal Flow » / « Indicateurs économiques CEEAC »
- [x] Vérifier que les liens ANSER RDC et Arzikin HASKE sont bien en place dans AMI/Partenariats
- [x] Tests : 135 tests passent, 0 erreur TypeScript
- [x] Sauvegarder le checkpoint
