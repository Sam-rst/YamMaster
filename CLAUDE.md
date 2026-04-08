# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YamMaster is a multiplayer Yahtzee-like dice game with a React Native/Expo frontend and a Node.js/Express + Socket.IO backend. All UI text and game terminology is in French.

## Commands

### Backend (`backend/`) — TypeScript
```bash
cd backend && npm install    # Install dependencies
cd backend && npm run build  # Compile TS → dist/
cd backend && npm run start  # Start compiled server (dist/index.js)
cd backend && npm run dev    # Start dev with ts-node
```

### Frontend (`frontend/`)
```bash
cd frontend && npm install   # Install dependencies
cd frontend && npm run start # Start Expo dev server
```

### Tests
```bash
cd backend && npm test              # Tests backend (Jest)
cd backend && npm run test:coverage # Tests backend + couverture
cd frontend && npm test             # Tests frontend (Jest + jsdom)
cd frontend && npm run test:coverage # Tests frontend + couverture
```

### Lint
```bash
cd backend && npm run lint          # ESLint backend
cd frontend && npm run lint         # ESLint frontend
```

### Build
```bash
cd backend && npm run build         # Compile TypeScript → dist/
cd backend && npm run typecheck     # Type check sans émission
cd frontend && npm run build        # Export web Expo
```

CI/CD via GitHub Actions — workflows séparés par environnement dans `.github/workflows/`.

## Gitflow

- **`main`** : production — lint, tests, build, déploiement prod
- **`recette`** : pré-production — lint, tests, build, déploiement recette
- **`develop`** : développement — lint, tests, build, déploiement dev
- **`feature/*`**, **`bugfix/*`**, **`hotfix/*`** : lint, tests, build (pas de déploiement)
- Branches mal nommées : **CI bloquée** (convention obligatoire)
- Détails : voir `docs/05-gitflow.md`

## Architecture

**Feature-Sliced Architecture** — Frontend et backend suivent la même convention : chaque feature = `screens/` + `components/` + `services/` + `models/` (frontend) ou `handlers/` + `services/` + `models/` + `routes/` (backend). Pas d'exception, même pour les features simples. Détails : voir `docs/07-architecture-cible.md`.

**Backend** (TypeScript) — Express + Socket.IO. Features dans `backend/src/features/` (game, auth, matchmaking, bot, history, leaderboard). Infrastructure dans `backend/src/infrastructure/` (BDD, Socket.IO setup). Types partagés dans `backend/src/shared/`.

**Frontend** (JavaScript/Expo) — Features dans `frontend/features/` (auth, home, game, history, replay, profile, leaderboard). Composants partagés dans `frontend/shared/`. Navigation centralisée dans `frontend/navigation/`.

**Real-time protocol**: Socket.IO events use `domain.action` naming (e.g., `game.dices.roll`, `game.choices.selected`, `game.grid.selected`). REST API pour les données persistées (auth, history, leaderboard).

## Key Conventions

- **File naming**: `kebab-case.component.js`, `.service.js`, `.controller.js`, `.context.js`, `.screen.js`
- **Socket events**: `domain.action` format (e.g., `game.dices.lock`, `game.grid.view-state`)
- **Game terms in French**: Brelan, Full, Carré, Yam, Suite, Sec, Défi
- **Turn system**: 30-second turns (`TURN_DURATION`), interval-based countdown, auto-switch on timeout
- **Dice**: 5 dice, up to 3 rolls per turn, lock/unlock individual dice between rolls

## Networking

Backend listens on `localhost:3000`. Frontend connects via `EXPO_PUBLIC_SERVER_URL` (prod) ou `EXPO_PUBLIC_SERVER_HOST_MOBILE` (dev mobile). Web platform connects to `localhost:3000`. CORS piloté par `ALLOWED_ORIGINS` (env var).

## Versioning (SemVer strict)

- **0.x.y** = en développement (état actuel, pas encore lancé publiquement)
- **1.0.0** = premier lancement public (réservé)
- Pre-release : `1.0.0-alpha.x`, `1.0.0-beta.x`, `1.0.0-rc.x`
- À chaque merge dans develop : **MINOR** (+feature) ou **PATCH** (+bugfix)
- À chaque merge dans main : **tag Git** (`git tag -a v0.x.y -m "description"`)
- Les versions sont synchronisées dans `backend/package.json` et `frontend/package.json`
- Voir `CHANGELOG.md` pour l'historique complet

## Infrastructure

- **Backend** : Render (free tier, auto-deploy depuis `develop`)
- **Base de données** : Neon PostgreSQL (Francfort, free tier)
- **Frontend web** : Vercel
- **Mobile** : Expo EAS (builds + OTA updates)
- **Infrastructure as Code** : Terraform dans `infra/`
- **Qualité** : SonarCloud (0 issue), couverture 90%+

## Gestion de projet

- **Jira** : source de vérité des tickets (https://samrst-studies.atlassian.net/jira/software/projects/YAM)
- **Confluence** : documentation projet (https://samrst-studies.atlassian.net/wiki/spaces/YAM)
- **Workflow** : Nouveau → Backlog → À spécifier → À estimer → Prêt → En développement → En revue → En QA → En recette → Terminé
- **Branches** : `feature/YAM-XX-description`, `bugfix/YAM-XX-description`
- **Commits** : en français, référencer le ticket Jira (`YAM-XX`)
- **Version centralisée** : `version.json` → `node scripts/sync-version.js`

## Workflow Rules

- **Versioning SemVer strict**: 0.x.y = dev, 1.0.0 = lancement public. MINOR pour les features, PATCH pour les bugfixes. Tag Git sur chaque merge dans main. Toujours mettre à jour `version` dans les deux package.json.
- **Auto-commit**: When a bug is confirmed fixed or a feature works, commit immediately without asking.
- **No Co-Authored-By**: Never add `Co-Authored-By` lines in commit messages.
- **Commit language**: Write commit messages in **French**.
- **TypeScript strict mode**: `strict: true`, no `any`. All WS payloads fully typed in `protocol.ts`.
- **Error handling**: Wrap network/DB/engine calls in try/catch. Never let a WS error crash the game. Show "Connection lost" screen on host disconnect.
- **TDD (Red → Green → Blue)**: Pour chaque feature ou bugfix : 1) **RED** écrire les tests (unitaires + intégration + E2E) qui échouent, 2) **GREEN** implémenter le minimum pour les faire passer, 3) **BLUE** refactoriser en appliquant le Software Craftsmanship : logs (INFO/WARN/ERROR), exceptions custom, try/catch, et conventions clean code (voir ci-dessous).
- **Software Craftsmanship (phase BLUE)**: Lors du refactoring, appliquer systématiquement : nommage explicite (pas d'abréviations), fonctions courtes (≤ 20 lignes, single responsibility), early return (éviter les niveaux d'indentation), constantes nommées (pas de magic numbers), logs structurés (INFO actions, WARN cas ignorés, ERROR exceptions), exceptions custom typées, try/catch sur tout code à effet de bord (socket, DB, timers).
- **3 niveaux de tests obligatoires**: Chaque feature doit avoir des tests **unitaires** (services/logique pure), **d'intégration** (handlers avec mock sockets) et **E2E** (vrai serveur Socket.IO). Utiliser les helpers `createMockSocket`/`createMockGame` pour l'intégration.
- **Commit avant changement**: Avant de commencer tout nouveau changement, s'assurer que le working tree est propre (commit ou stash). Ne jamais empiler des changements non commités.
- **Couverture de tests**: Viser **90%** de couverture minimum. Tous les tests doivent passer au vert avant de considérer un changement comme terminé.
- **Linter**: **0 erreur, 0 warning** sur backend ET frontend. Passer le lint après les tests verts et avant la mise à jour de la doc.
- **Documentation**: Mettre à jour ou créer la documentation **après** que les tests et le lint passent et **juste avant** le commit.
- **Ordre de validation**: code → tests verts → lint 0 erreur/warning → docs → commit.
- **Architecture Feature-Sliced**: Toute nouvelle feature doit suivre la structure convention : `screens/` + `components/` + `services/` + `models/` (frontend) ou `handlers/` + `services/` + `models/` + `routes/` (backend). Toujours les 4 dossiers, même si un fichier est léger. Voir `docs/07-architecture-cible.md`.
- **Hiérarchie des composants**: Les sous-composants d'un composant parent doivent être dans le dossier du parent. Si `Board` utilise `Grid`, `Choices`, `Dice`, alors ces dossiers sont **dans** `board/`, pas à côté. La structure des dossiers reflète l'arbre de rendu React.
- **Zéro logique métier côté frontend**: Le frontend est exclusivement une couche d'affichage et de communication avec le backend. Aucun calcul, aucune déduction, aucune transformation de données. Toute logique (résultats, scores, validations) est calculée côté backend et envoyée prête à afficher. Le frontend ne fait que : recevoir → afficher, cliquer → émettre.
