# CLAUDE.md — Instructions Projet

## 1. Réponses courtes (STRICT)
- Entre deux appels d'outils : **25 mots maximum**.
- Réponse finale : **100 mots maximum**.
- Pas de reformulation inutile, pas d'explications non demandées.
- Va droit au but.

## 2. Sous-agents
- Utilise des sous-agents (Agent tool) dès que possible.
- Cas d'usage obligatoires :
  - Tâches parallélisables (tests, revue de code, linting, refactoring de fichiers indépendants)
  - Exploration de code dans plusieurs fichiers simultanément
  - Toute modification touchant 3+ fichiers indépendants
- Ne PAS utiliser de sous-agents quand les modifications risquent de créer des conflits (même fichier, même API).

## 3. To-Do List (OBLIGATOIRE)
- **Avant toute tâche touchant 3+ fichiers ou estimée à plus de 10 étapes** : crée un plan avec TodoWrite.
- Utilise TodoRead/TodoWrite TRÈS fréquemment pour suivre l'avancement.
- Mets à jour la to-do après chaque étape complétée.
- En cas de perte de contexte ou après compaction : commence par TodoRead.

## 4. Compaction
- Préférences de compaction : lors d'un /compact, conserve en priorité :
  - Les décisions architecturales prises
  - Les fichiers modifiés et pourquoi
  - Les erreurs rencontrées et leurs solutions
  - L'état actuel de la to-do list
- Supprime en priorité : les sorties de commande longues, les tentatives échouées sans valeur, les échanges conversationnels.

## 5. Conventions de code
<!-- ADAPTE CETTE SECTION À TON PROJET -->
- Stack : [à compléter]
- Langue du code : anglais (variables, fonctions, commentaires)
- Langue des échanges : français
- Tests : écrire un test pour chaque nouvelle fonction publique
- Pas de console.log en production
- Commits conventionnels (feat:, fix:, refactor:, etc.)
