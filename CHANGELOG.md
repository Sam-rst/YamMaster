# Changelog

Toutes les modifications notables de ce projet sont documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhere au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.3.0] — 2026-03-31

### Ajoute
- **Profil joueur** — ecran complet avec statistiques, avatar et rang
- **Systeme de rang** — Bronze, Argent, Or, Diamant, Maitre avec sous-tiers (IV → I)
- **Selection d'avatar** — 8 emojis au choix (🎲 👑 🎯 ⚡ 🔥 🏆 💎 🐉)
- **Stats avancees** — taux de victoire, serie de victoires, parties par mode
- **Onglet Profil** — 3e onglet dans la tab bar (Accueil / Regles / Profil)
- Routes REST profil (`GET /api/profile/:userId`, `PUT /api/profile/:userId/avatar`)
- Champ `avatar` sur le modele User (defaut 🎲)

---

## [1.2.0] — 2026-03-28

### Ajoute
- **3 niveaux de difficulte bot** — Facile, Moyen, Difficile
  - Facile : combinaisons simples, placement aleatoire
  - Moyen : priorite combinaisons fortes, placement adjacent aux pions
  - Difficile : scoring, construction d'alignements, blocage adversaire
- **Ecran de selection de difficulte** — Debutant / Tactique / Maitre IA
- **Splash screen** — Design Neon Nocturne au lancement
- Enum `BotDifficulty` (EASY, MEDIUM, HARD) en base de donnees
- Propagation de la difficulte dans toute la chaine backend

---

## [1.1.0] — 2026-03-25

### Ajoute
- **Ecran Regles du jeu** — 5 sections en accordeon (Des, Combinaisons, Grille, Actions speciales, Scoring)
- **Mode Ponder** — animations step-by-step pour visualiser les regles
  - 5 scenes interactives (Des, Combinaisons, Grille, Actions speciales, Scoring)
  - Modal PonderModal avec autoplay et controles (play/pause, timeline, navigation)
  - Bouton "Voir en action" dans chaque section
- **Bottom Tab Bar** — navigation par onglets (Accueil / Regles)
- **Modal regles en partie** — accessible depuis le board via un bouton

---

## [1.0.0] — 2026-03-20

### Ajoute
- **Replay visuel** — revisualistion tour par tour avec plateau de jeu complet
  - Composants read-only (ReplayGrid, ReplayDice, ReplayScores, ReplayActionInfo)
  - Controller replay avec parsing paires action/snapshot
  - Autoplay avec lecture automatique tour par tour
  - Snapshots GameState enregistres apres chaque action
- **Historique des parties** — liste des parties jouees avec scores et resultats
  - Routes REST (`GET /api/history/user/:userId`, `GET /api/history/game/:gameId`)
  - Stockage des replays en JSON dans la base de donnees
- **Sauvegarde en base** — persistance des parties (Game, GamePlayer) via Prisma
- **Design Neon Nocturne** — refonte complete de l'interface
  - Ecran de fin de partie, board, historique, replay
  - Des avec vrais dots au lieu de chiffres
  - Theme centralise (colors, fonts, game-styles)
- **Ecran de fin de partie** — affichage victoire/defaite avec scores

### Modifie
- Architecture replay refactorisee (controller + composants visuels)
- Styles de jeu centralises dans `shared/theme/`
- Migration vers l'architecture Feature-Sliced complete

---

## [0.9.0] — 2026-03-15

### Ajoute
- **Authentification** — login/register avec hachage bcrypt
  - Auto-creation de compte si nouvel utilisateur
  - Verification de disponibilite du username
  - Persistance du token dans AsyncStorage
- **Base de donnees PostgreSQL** — schema Prisma avec User, Game, GamePlayer
- **Migration TypeScript** — backend en TypeScript strict (`strict: true`, zero `any`)
- **CI/CD GitHub Actions** — pipelines par environnement (develop, recette, main, feature/*)
- **Tests** — batteries de tests frontend et backend avec couverture 90%+

### Corrige
- Isolation des parties (pas de fuite d'etat entre sessions)
- Validation des tours (empeche les actions hors-tour)
- Timing du `dbGameId` (correction race condition a la creation)
- Exclusions de couverture backend corrigees

---

## [0.5.0] — 2026-03-08

### Ajoute
- **Mode VS Bot** — affrontement contre un bot avec strategie adaptative
- **Defi et Yam Predator** — actions speciales en jeu
- **Mode developpeur** — panel pour tester les scenarios de fin de partie
- **Variables d'environnement** — `.env` backend + frontend via `EXPO_PUBLIC_*`

### Corrige
- Timer court (5s) au 3e lancer uniquement si aucune combinaison jouable
- Defi ne valide que si une combinaison non-brelan existe
- Cleanup des listeners Socket.IO sur tous les composants
- Crash serveur en fin de partie (interval non nettoye)

---

## [0.1.0] — 2026-03-01

### Ajoute
- **Partie en ligne** — matchmaking temps reel via Socket.IO
- **Moteur de jeu** — 5 des, 3 lancers/tour, timer 30s, grille 5×5
- **13 combinaisons** — Brelan 1-6, Full, Carre, Yam, Suite, ≤8, Sec, Defi
- **Systeme de pions** — 12 pions par joueur, detection de victoire (alignement 5)
- **Calcul de scores** — par alignements de pions (3, 4, 5)
- **Interface React Native / Expo** — board, des, grille, choix, scores, timer
- **Communication Socket.IO** — protocole `domain.action` temps reel
- Setup initial du projet (Express, Socket.IO, React Native, Expo)
