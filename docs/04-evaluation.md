# Grille d'évaluation — Yam Master

Référence : TP Evaluation Finale du module Architecture Applicative (EPSI M1).

---

## Fonctionnalités obligatoires (14 pts)

### Finition du moteur de jeu — 6 pts

| Critère | Points | Phase roadmap | Statut |
|---------|--------|---------------|--------|
| Gestion des scores (alignements 3 = 1pt, 4 = 2pts, 5 = victoire) | ~1.5 | Phase 1.2 | A FAIRE |
| Gestion des 12 pions par joueur (décrément à chaque pose) | ~1 | Phase 1.3 | A FAIRE |
| Vérification des conditions de victoire après chaque pose (lignes H/V/D, plus de pions) | ~1.5 | Phase 1.4 | A FAIRE |
| Écran "Résumé de la partie" (vainqueur, perdant, scores) | ~1 | Phase 1.5 | A FAIRE |
| Workflow fin de partie (retour menu, relancer, etc.) | ~0.5 | Phase 1.5 | A FAIRE |
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

| Critère | Comment y répondre |
|---------|--------------------|
| Qualité du code | Factorisation, nommage, séparation des responsabilités |
| Architecture fichiers | Arborescence claire, services externalisés |
| README professionnel | Stack technique, comment lancer, architecture globale |
| Exécution locale | Tout doit tourner en local (pas de dépendance cloud obligatoire) |
| Projet GitHub public | Historique de commits propre, messages clairs |

---

## Modalités de rendu

- **Contact** : julien.couraud@mail-formateur.net
- **Objet du mail** : `[I1DEV-ARCHI] NOM Prénom / NOM Prénom`
- **Attendu** :
  - Projet GitHub public
  - README professionnel (stack, lancement, architecture)
  - Tout exécutable en local
