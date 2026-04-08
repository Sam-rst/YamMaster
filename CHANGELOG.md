# Changelog

Toutes les modifications notables de ce projet sont documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhere au [Semantic Versioning](https://semver.org/lang/fr/).

> **Convention** : La version 1.0.0 sera le premier lancement public.
> Tant que le projet est en pre-release (0.x.y), les versions suivent :
> - **0.MINOR.0** = nouvelle feature ou milestone
> - **0.x.PATCH** = bugfix
> - Pre-release tags : `1.0.0-alpha.x`, `1.0.0-beta.x`, `1.0.0-rc.x`

---

## [0.15.0] — 2026-04-08

### Ajoute
- **Infrastructure Terraform** — modules Render (backend) + Neon (PostgreSQL), environnements dev et prod
- **Backend deploye** sur Render (free, branche develop, auto-deploy)
- **Base PostgreSQL** sur Neon (Francfort, migration Prisma auto au deploy)
- **Expo EAS** — configuration builds mobile (development, preview, production)
- **CI : rebuild APK/IPA auto** quand package.json, app.json, eas.json ou assets changent
- **CI : OTA updates auto** sur push develop/recette/main (changements JS)
- **URL backend par profil EAS** (dev → Render dev, prod → Render prod)
- **Version centralisee** — `version.json` source unique + script `sync-version.js`
- **Assets placeholder** — icon.png, adaptive-icon.png, favicon.png, splash-icon.png
- **Documentation** — convention SemVer, roadmap Phase 5, pipeline SonarCloud dans gitflow

### Corrige
- Host endpoint Neon (utilisait le host projet au lieu de l'endpoint branche)
- `expo-dev-client` retire (cassait la compatibilite Expo Go en local)
- URL backend injectee via `app.config.ts` + `expo-constants`
- Migration Prisma ajoutee au build command Render

### Modifie
- `app.json` remplace par `app.config.ts` (config dynamique)
- CORS pilote par `ALLOWED_ORIGINS` (variable d'environnement)
- IP hardcodee supprimee du fallback mobile
- Reset versioning SemVer (1.3.0 → 0.15.0, 1.0.0 reserve pour le lancement public)

---

## [0.14.0] — 2026-04-03

### Ajoute
- **Analyse SonarCloud** — integration dans le pipeline CI (toutes branches)
- **Seuils de couverture** centralises dans les scripts `test:coverage` des package.json

### Corrige
- 71 issues SonarQube corrigees (vulnerabilites, complexite cognitive, code smells)
- CORS securise via variable `ALLOWED_ORIGINS`
- IP hardcodee supprimee du fallback mobile
- Mots de passe en dur remplaces par des variables d'environnement dans docker-compose

### Modifie
- Action SonarQube mise a jour vers v6
- Secrets herites dans les workflows reutilisables (`secrets: inherit`)
- Couverture frontend amelioree (functions 89% -> 94%)

---

## [0.13.0] — 2026-03-31

### Ajoute
- **Profil joueur** — ecran complet avec statistiques, avatar et rang
- **Systeme de rang** — Bronze, Argent, Or, Diamant, Maitre avec sous-tiers (IV -> I)
- **Selection d'avatar** — 8 emojis au choix
- **Stats avancees** — taux de victoire, serie de victoires, parties par mode
- **Onglet Profil** — 3e onglet dans la tab bar (Accueil / Regles / Profil)
- Routes REST profil (`GET /api/profile/:userId`, `PUT /api/profile/:userId/avatar`)
- Champ `avatar` sur le modele User (defaut 🎲)

---

## [0.12.0] — 2026-03-28

### Ajoute
- **3 niveaux de difficulte bot** — Facile, Moyen, Difficile
  - Facile : combinaisons simples, placement aleatoire
  - Moyen : priorite combinaisons fortes, placement adjacent aux pions
  - Difficile : scoring, construction d'alignements, blocage adversaire
- **Ecran de selection de difficulte** — Debutant / Tactique / Maitre IA
- **Splash screen** — Design Neon Nocturne au lancement
- Enum `BotDifficulty` (EASY, MEDIUM, HARD) en base de donnees

---

## [0.11.0] — 2026-03-25

### Ajoute
- **Ecran Regles du jeu** — 5 sections en accordeon (Des, Combinaisons, Grille, Actions speciales, Scoring)
- **Mode Ponder** — animations step-by-step pour visualiser les regles
  - 5 scenes interactives avec autoplay et controles
  - Modal PonderModal avec play/pause, timeline, navigation
  - Bouton "Voir en action" dans chaque section
- **Bottom Tab Bar** — navigation par onglets (Accueil / Regles)
- **Modal regles en partie** — accessible depuis le board

---

## [0.10.0] — 2026-03-20

### Ajoute
- **Replay visuel** — revisualisation tour par tour avec plateau de jeu complet
  - Composants read-only (ReplayGrid, ReplayDice, ReplayScores, ReplayActionInfo)
  - Controller replay avec parsing paires action/snapshot
  - Autoplay avec lecture automatique tour par tour
- **Historique des parties** — liste des parties jouees avec scores et resultats
  - Routes REST (`GET /api/history/user/:userId`, `GET /api/history/game/:gameId`)
  - Stockage des replays en JSON dans la base de donnees
- **Sauvegarde en base** — persistance des parties (Game, GamePlayer) via Prisma
- **Design Neon Nocturne** — refonte complete de l'interface
- **Ecran de fin de partie** — affichage victoire/defaite avec scores

### Modifie
- Architecture replay refactorisee (controller + composants visuels)
- Styles de jeu centralises dans `shared/theme/`
- Migration vers l'architecture Feature-Sliced complete

---

## [0.9.0] — 2026-03-15

### Ajoute
- **Authentification** — login/register avec hachage bcrypt
- **Base de donnees PostgreSQL** — schema Prisma avec User, Game, GamePlayer
- **Migration TypeScript** — backend en TypeScript strict (`strict: true`, zero `any`)
- **CI/CD GitHub Actions** — pipelines par environnement (develop, recette, main, feature/*)
- **Tests** — batteries de tests frontend et backend avec couverture 90%+

### Corrige
- Isolation des parties (pas de fuite d'etat entre sessions)
- Validation des tours (empeche les actions hors-tour)
- Timing du `dbGameId` (correction race condition a la creation)

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

---

## [0.1.0] — 2026-03-01

### Ajoute
- **Partie en ligne** — matchmaking temps reel via Socket.IO
- **Moteur de jeu** — 5 des, 3 lancers/tour, timer 30s, grille 5x5
- **13 combinaisons** — Brelan 1-6, Full, Carre, Yam, Suite, <=8, Sec, Defi
- **Systeme de pions** — 12 pions par joueur, detection de victoire (alignement 5)
- **Calcul de scores** — par alignements de pions (3, 4, 5)
- **Interface React Native / Expo** — board, des, grille, choix, scores, timer
- **Communication Socket.IO** — protocole `domain.action` temps reel
- Setup initial du projet (Express, Socket.IO, React Native, Expo)
