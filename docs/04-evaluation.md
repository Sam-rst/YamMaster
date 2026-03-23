# Grille d'évaluation — Yam Master

Référence : TP Evaluation Finale du module Architecture Applicative (EPSI M1).

---

## Fonctionnalités obligatoires (14 pts)

### Finition du moteur de jeu — 6 pts

| Critère | Points | Phase roadmap | Statut |
|---------|--------|---------------|--------|
| Gestion des scores (alignements 3 = 1pt, 4 = 2pts, 5 = victoire) | ~1.5 | Phase 1.2 | FAIT |
| Gestion des 12 pions par joueur (décrément à chaque pose) | ~1 | Phase 1.3 | FAIT |
| Vérification des conditions de victoire après chaque pose (lignes H/V/D, plus de pions) | ~1.5 | Phase 1.4 | FAIT |
| Écran "Résumé de la partie" (vainqueur, perdant, scores) | ~1 | Phase 1.5 | FAIT |
| Workflow fin de partie (retour menu, relancer, etc.) | ~0.5 | Phase 1.5 | FAIT |
| (Optionnel) Défi + Yam Predator | ~0.5 | Phase 1.6 | A FAIRE |

### Mode VS Bot — 8 pts

| Critère | Points | Phase roadmap | Statut |
|---------|--------|---------------|--------|
| Utilisation du socle existant (factorisation avec le mode en ligne) | ~2 | Phase 2.1 | A FAIRE |
| Bot fonctionnel qui joue via la même API WebSocket | ~3 | Phase 2.2 | A FAIRE |
| Frontend VsBot intégré (lancement, board, fin de partie) | ~2 | Phase 2.3 | A FAIRE |
| Qualité de la stratégie du bot | ~1 | Phase 2.2-2.4 | A FAIRE |

---

## Fonctionnalités au choix — au moins 1 (6 pts)

| Option | Description | Phase roadmap | Statut |
|--------|-------------|---------------|--------|
| **A** | UI améliorée ("effet whouaaaaaa") | Phase 3B | A FAIRE |
| **B** | Auth + BDD + sauvegarde des parties (Docker local ou API REST en ligne) | Phase 3A | A FAIRE |

---

## Critères transversaux (évaluation implicite)

Le cahier des charges mentionne explicitement : *"vous serez jugés sur la pertinence des améliorations en terme de qualité"*.

| Critère | Comment y répondre | Statut |
|---------|--------------------|--------|
| Qualité du code | Factorisation, nommage, séparation des responsabilités | EN COURS — TDD, 135 tests, >90% couverture |
| Architecture fichiers | Arborescence claire, services externalisés | EN COURS — composants séparés (tokens, scores, timers, etc.) |
| README professionnel | Stack technique, comment lancer, architecture globale | A FAIRE |
| Exécution locale | Tout doit tourner en local (pas de dépendance cloud obligatoire) | FAIT |
| Projet GitHub public | Historique de commits propre, messages clairs | EN COURS |

---

## Modalités de rendu

- **Contact** : julien.couraud@mail-formateur.net
- **Objet du mail** : `[I1DEV-ARCHI] NOM Prénom / NOM Prénom`
- **Attendu** :
  - Projet GitHub public
  - README professionnel (stack, lancement, architecture)
  - Tout exécutable en local
