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

CI/CD via GitHub Actions (`.github/workflows/ci.yml`).

## Gitflow

- **`main`** : production — lint, tests, build, déploiement prod
- **`recette`** : pré-production — lint, tests, build, déploiement recette
- **`develop`** : développement — lint, tests, build, déploiement dev
- **`feature/*`**, **`bugfix/*`**, **`hotfix/*`** : lint, tests, build (pas de déploiement)
- Branches mal nommées : **CI bloquée** (convention obligatoire)
- Détails : voir `docs/05-gitflow.md`

## Architecture

**Backend** (TypeScript) — Single Express server (`backend/src/index.ts`) using Socket.IO for real-time game state. Game logic lives in `backend/src/services/game.service.ts` as a `GameService` module with sub-domains: `init`, `send`, `utils`, `timer`, `dices`, `choices`, `grid`, `game`. Bot logic in `backend/src/services/bot.service.ts`. Types partagés dans `backend/src/types.ts`. Global arrays (`games[]`, `queue[]`) hold active games and matchmaking queue in memory (no database).

**Frontend** — Expo/React Native app. Entry point: `frontend/App.js`. Uses React Navigation (stack) with three screens: `HomeScreen`, `OnlineGameScreen`, `VsBotGameScreen` (stub). Socket.IO connection is provided via React Context (`contexts/socket.context.js`). Game state is coordinated through `controllers/online-game.controller.js`.

**Component hierarchy**: `board.component.js` composes timers, decks (dice), choices (combination selection), grid (5×5), scores, and infos as child components under `components/board/`.

**Real-time protocol**: Socket.IO events use `domain.action` naming (e.g., `game.dices.roll`, `game.choices.selected`, `game.grid.selected`). Server emits view-state updates to both players via helper functions (`updateClientsViewDecks`, `updateClientsViewChoices`, etc.).

## Key Conventions

- **File naming**: `kebab-case.component.js`, `.service.js`, `.controller.js`, `.context.js`, `.screen.js`
- **Socket events**: `domain.action` format (e.g., `game.dices.lock`, `game.grid.view-state`)
- **Game terms in French**: Brelan, Full, Carré, Yam, Suite, Sec, Défi
- **Turn system**: 30-second turns (`TURN_DURATION`), interval-based countdown, auto-switch on timeout
- **Dice**: 5 dice, up to 3 rolls per turn, lock/unlock individual dice between rolls

## Networking

Backend listens on `localhost:3000`. Frontend connects via hardcoded IP for native platforms (requires ngrok for HTTPS tunneling on physical devices — see README). Web platform connects to `localhost:3000`.

## Workflow Rules

- **Auto-commit**: When a bug is confirmed fixed or a feature works, commit immediately without asking.
- **No Co-Authored-By**: Never add `Co-Authored-By` lines in commit messages.
- **Commit language**: Write commit messages in **French**.
- **TypeScript strict mode**: `strict: true`, no `any`. All WS payloads fully typed in `protocol.ts`.
- **Error handling**: Wrap network/DB/engine calls in try/catch. Never let a WS error crash the game. Show "Connection lost" screen on host disconnect.
- **TDD**: Toujours écrire les tests en premier (Red → Green → Refactor). Pour chaque nouvelle fonctionnalité ou correction de bug : 1) écrire un test qui échoue, 2) implémenter le minimum pour le faire passer, 3) refactoriser.
- **Commit avant changement**: Avant de commencer tout nouveau changement, s'assurer que le working tree est propre (commit ou stash). Ne jamais empiler des changements non commités.
- **Couverture de tests**: Viser **90%** de couverture minimum. Tous les tests doivent passer au vert avant de considérer un changement comme terminé.
- **Linter**: **0 erreur, 0 warning** sur backend ET frontend. Passer le lint après les tests verts et avant la mise à jour de la doc.
- **Documentation**: Mettre à jour ou créer la documentation **après** que les tests et le lint passent et **juste avant** le commit.
- **Ordre de validation**: code → tests verts → lint 0 erreur/warning → docs → commit.