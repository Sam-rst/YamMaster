# Architecture cible — Feature-Sliced Fullstack

## Philosophie

**Une seule règle d'architecture** : chaque feature (frontend ou backend) suit exactement la même structure interne. Pas d'exception, pas de "c'est trop petit pour". Un nouveau développeur n'a jamais à se demander "quelle convention appliquer ici ?".

## Vue d'ensemble Fullstack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    Expo / React Native                           │
│                                                                  │
│  shared/          ← Composants, hooks, contexts, services       │
│  features/        ← Chaque feature = screens + components       │
│    auth/             + services + models                         │
│    home/                                                         │
│    game/                                                         │
│    history/                                                      │
│    replay/                                                       │
│    profile/                                                      │
│    leaderboard/                                                  │
│  navigation/      ← Stack Navigator centralisé                  │
│                                                                  │
│                  socket.io-client  ←──→  REST API (auth, data)  │
└──────────────────────┬───────────────────────┬──────────────────┘
                       │ WebSocket             │ HTTP
                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│               Express / Node.js / TypeScript                     │
│                                                                  │
│  shared/          ← Types, utils, middlewares                    │
│  features/        ← Chaque feature = handlers + services        │
│    auth/             + models + routes                           │
│    game/                                                         │
│    matchmaking/                                                  │
│    bot/                                                          │
│    history/                                                      │
│    leaderboard/                                                  │
│  infrastructure/  ← BDD (Prisma), Socket.IO setup, config       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Convention universelle — Structure d'une feature

### Frontend

```
features/<nom>/
├── screens/          Écrans React Navigation (1 par route)
│   └── <nom>.screen.tsx
├── components/       Composants UI spécifiques à la feature
│   ├── <widget-a>.component.tsx
│   └── <widget-b>.component.tsx
├── services/         Logique métier, appels API, gestion socket
│   └── <nom>.service.ts
└── models/           Types, constantes, interfaces
    └── <nom>.model.ts
```

### Backend

```
features/<nom>/
├── handlers/         Gestionnaires d'événements (socket.on / express routes)
│   └── <nom>.handler.ts
├── services/         Logique métier pure (fonctions sans side effects)
│   └── <nom>.service.ts
├── models/           Types, interfaces, schémas Prisma associés
│   └── <nom>.model.ts
└── routes/           Routes REST (si applicable)
    └── <nom>.routes.ts
```

**Règle** : chaque feature contient **toujours** les 4 dossiers, même si un fichier ne fait que 10 lignes. La cohérence prime sur la concision.

---

## Frontend — Architecture détaillée

### Arborescence complète

```
frontend/
├── App.js                            Point d'entrée
├── config.js                         Configuration (URL serveur, flags)
├── .env                              Variables d'environnement
│
├── navigation/
│   └── app.navigator.js              Stack Navigator centralisé
│
├── shared/
│   ├── components/
│   │   ├── button.component.tsx       Bouton réutilisable
│   │   ├── card.component.tsx         Carte générique
│   │   ├── modal.component.tsx        Modal générique
│   │   ├── avatar.component.tsx       Avatar joueur
│   │   └── loading.component.tsx      Indicateur de chargement
│   ├── contexts/
│   │   ├── socket.context.js         Connexion Socket.IO
│   │   └── auth.context.js           Contexte d'authentification
│   ├── hooks/
│   │   ├── useSocket.js              Hook typé pour écouter/émettre
│   │   └── useAuth.js                Hook d'accès au contexte auth
│   └── services/
│       └── api.service.ts            Client HTTP de base (fetch wrapper)
│
└── features/
    ├── auth/
    │   ├── screens/
    │   │   └── auth.screen.tsx
    │   ├── components/
    │   │   ├── login-form.component.tsx
    │   │   └── register-form.component.tsx
    │   ├── services/
    │   │   └── auth.service.ts
    │   └── models/
    │       └── auth.model.ts
    │
    ├── home/
    │   ├── screens/
    │   │   └── home.screen.tsx
    │   ├── components/
    │   │   ├── menu-card.component.tsx
    │   │   ├── player-stats.component.tsx
    │   │   └── online-count.component.tsx
    │   ├── services/
    │   │   └── home.service.ts
    │   └── models/
    │       └── home.model.ts
    │
    ├── game/
    │   ├── screens/
    │   │   ├── online-game.screen.tsx
    │   │   └── vs-bot-game.screen.tsx
    │   ├── components/
    │   │   ├── board/
    │   │   │   └── board.component.tsx
    │   │   ├── grid/
    │   │   │   ├── grid.component.tsx
    │   │   │   └── grid-cell.component.tsx
    │   │   ├── dice/
    │   │   │   ├── deck.component.tsx       UN composant (prop isOpponent)
    │   │   │   └── die.component.tsx
    │   │   ├── choices/
    │   │   │   └── choices.component.tsx
    │   │   ├── player-bar/
    │   │   │   ├── player-bar.component.tsx  Barre unifiée (prop isOpponent)
    │   │   │   ├── timer.component.tsx
    │   │   │   ├── score.component.tsx
    │   │   │   ├── tokens.component.tsx
    │   │   │   └── info.component.tsx
    │   │   ├── end-screen/
    │   │   │   └── end-screen.component.tsx
    │   │   └── dev/
    │   │       └── dev-panel.component.tsx
    │   ├── controllers/
    │   │   ├── online-game.controller.tsx   Controller partie en ligne
    │   │   └── vs-bot-game.controller.tsx   Controller partie vs bot
    │   ├── services/
    │   │   └── game-socket.service.ts      Encapsule les events socket du jeu
    │   └── models/
    │       └── game.model.ts               Types/constantes du jeu
    │
    ├── history/
    │   ├── screens/
    │   │   └── history.screen.tsx
    │   ├── components/
    │   │   ├── game-list.component.tsx
    │   │   └── game-card.component.tsx
    │   ├── services/
    │   │   └── history.service.ts
    │   └── models/
    │       └── history.model.ts
    │
    ├── replay/
    │   ├── screens/
    │   │   └── replay.screen.tsx
    │   ├── components/
    │   │   ├── replay-board.component.tsx
    │   │   └── replay-controls.component.tsx
    │   ├── services/
    │   │   └── replay.service.ts
    │   └── models/
    │       └── replay.model.ts
    │
    ├── profile/
    │   ├── screens/
    │   │   └── profile.screen.tsx
    │   ├── components/
    │   │   ├── stats-dashboard.component.tsx
    │   │   └── achievement-badge.component.tsx
    │   ├── services/
    │   │   └── profile.service.ts
    │   └── models/
    │       └── profile.model.ts
    │
    └── leaderboard/
        ├── screens/
        │   └── leaderboard.screen.tsx
        ├── components/
        │   ├── podium.component.tsx
        │   └── ranked-list.component.tsx
        ├── services/
        │   └── leaderboard.service.ts
        └── models/
            └── leaderboard.model.ts
```

### Principes clés frontend

| Principe | Explication |
|----------|-------------|
| **Un composant = une responsabilité** | `deck.component.tsx` gère l'affichage des dés, pas la logique de verrouillage |
| **Props > duplication** | `<PlayerBar isOpponent={true}>` au lieu de `<OpponentInfos>` + `<OpponentTimer>` + `<OpponentScore>` séparés |
| **Controller = orchestration** | Le controller gère les events socket et distribue l'état aux composants via props |
| **Service = logique métier** | Les appels API, transformations de données, logique de jeu frontend |
| **Model = contrats** | Types, constantes, interfaces partagées au sein de la feature |

---

## Backend — Architecture détaillée

### Arborescence cible

```
backend/src/
├── index.ts                          Point d'entrée (Express + Socket.IO setup)
│
├── shared/
│   ├── types.ts                      Types globaux (PlayerKey, SocketLike, etc.)
│   ├── config.ts                     Configuration (ports, durées, flags)
│   └── middlewares/
│       └── auth.middleware.ts         Middleware d'authentification
│
├── infrastructure/
│   ├── socket.ts                     Setup Socket.IO + routing des events
│   ├── database.ts                   Connexion Prisma / config BDD
│   └── server.ts                     Setup Express
│
└── features/
    ├── auth/
    │   ├── handlers/
    │   │   └── auth.handler.ts       Socket/REST handlers login/logout
    │   ├── services/
    │   │   └── auth.service.ts       Hash password, vérification, création auto
    │   ├── models/
    │   │   └── auth.model.ts         Types User, LoginPayload, etc.
    │   └── routes/
    │       └── auth.routes.ts        POST /auth/login, POST /auth/register
    │
    ├── game/
    │   ├── handlers/
    │   │   └── game.handler.ts       Socket handlers (roll, lock, select, etc.)
    │   ├── services/
    │   │   ├── game.service.ts       Moteur de jeu pur (existant, refactoré)
    │   │   └── game-session.service.ts  Gestion du cycle de vie des parties
    │   ├── models/
    │   │   └── game.model.ts         Types Game, GameState, Deck, Grid, etc.
    │   └── routes/
    │       └── game.routes.ts        GET /games/:id (détail partie)
    │
    ├── matchmaking/
    │   ├── handlers/
    │   │   └── matchmaking.handler.ts  Socket handlers queue.join
    │   ├── services/
    │   │   └── matchmaking.service.ts  Gestion de la file d'attente
    │   ├── models/
    │   │   └── matchmaking.model.ts    Types QueueEntry
    │   └── routes/
    │       └── matchmaking.routes.ts   (vide pour l'instant)
    │
    ├── bot/
    │   ├── handlers/
    │   │   └── bot.handler.ts        Socket handler game.vsbot
    │   ├── services/
    │   │   ├── bot.service.ts        Logique décisionnelle (existant)
    │   │   └── bot-client.service.ts  Fake socket + boucle de jeu
    │   ├── models/
    │   │   └── bot.model.ts          Types BotDifficulty, BotConfig
    │   └── routes/
    │       └── bot.routes.ts         (vide pour l'instant)
    │
    ├── history/
    │   ├── handlers/
    │   │   └── history.handler.ts    (vide — tout passe par REST)
    │   ├── services/
    │   │   └── history.service.ts    CRUD parties en BDD
    │   ├── models/
    │   │   └── history.model.ts      Types GameRecord, GameSummary
    │   └── routes/
    │       └── history.routes.ts     GET /history, GET /history/:id
    │
    ├── profile/
    │   ├── handlers/
    │   │   └── profile.handler.ts    (vide — tout passe par REST)
    │   ├── services/
    │   │   └── profile.service.ts    Stats, rang, win streak, avatar
    │   ├── models/
    │   │   └── profile.model.ts      Types ProfileStats, RankInfo
    │   └── routes/
    │       └── profile.routes.ts     GET /api/profile/:userId, PUT /api/profile/:userId/avatar
    │
    └── leaderboard/
        ├── handlers/
        │   └── leaderboard.handler.ts  (vide — tout passe par REST)
        ├── services/
        │   └── leaderboard.service.ts  Calcul MMR, classement
        ├── models/
        │   └── leaderboard.model.ts    Types PlayerRank, LeaderboardEntry
        └── routes/
            └── leaderboard.routes.ts   GET /leaderboard (non implémenté)
```

### Principes clés backend

| Principe | Explication |
|----------|-------------|
| **Handler = point d'entrée** | Reçoit l'event socket ou la requête HTTP, appelle le service, renvoie la réponse |
| **Service = logique métier pure** | Pas de `socket.emit`, pas de `req/res`. Entrée → sortie. Testable unitairement |
| **Model = types + constantes** | Définitions partagées au sein de la feature |
| **Route = exposition REST** | Points d'accès HTTP pour les données persistées |
| **Infrastructure = plomberie** | Setup technique (BDD, Socket.IO, Express) — pas de logique métier |

### Migration depuis l'existant

Le refactoring du backend se fait en extrayant la logique de `index.ts` (423 lignes) :

| Logique actuelle dans index.ts | Destination |
|-------------------------------|-------------|
| `handleDiceRoll`, `handleDiceLock`, `handleChoiceSelected`, `handleGridSelected` | `features/game/handlers/game.handler.ts` |
| `switchTurn`, `startGameTimer` | `features/game/services/game-session.service.ts` |
| `updateClientsView*` (5 fonctions) | `features/game/handlers/game.handler.ts` (helpers privés) |
| `newPlayerInQueue`, `createGame` | `features/matchmaking/services/matchmaking.service.ts` |
| `createBotSocket`, `setupBotListeners`, `createGameVsBot` | `features/bot/services/bot-client.service.ts` |
| `games[]`, `queue[]` | `features/game/services/game-session.service.ts` (encapsulés) |
| `GameService` | `features/game/services/game.service.ts` (inchangé, déjà propre) |
| `BotService` | `features/bot/services/bot.service.ts` (inchangé) |
| Types dans `types.ts` | Distribués dans les `models/` de chaque feature |

---

## Cohérence Fullstack

### Correspondance feature ↔ feature

| Feature Frontend | Feature Backend | Communication |
|-----------------|-----------------|---------------|
| `features/auth/` | `features/auth/` | REST (POST /auth/login) |
| `features/game/` | `features/game/` + `features/matchmaking/` | WebSocket |
| `features/game/` (VsBot) | `features/bot/` | WebSocket (même API) |
| `features/history/` | `features/history/` | REST (GET /history) |
| `features/replay/` | `features/history/` (mêmes données) | REST (GET /history/:id) |
| `features/profile/` | `features/profile/` | REST (GET /api/profile/:userId, PUT /api/profile/:userId/avatar) |
| `features/leaderboard/` | `features/leaderboard/` | REST (GET /leaderboard) |

### Convention de nommage unifiée

| Convention | Frontend | Backend |
|-----------|----------|---------|
| Fichiers | `kebab-case.<type>.js` | `kebab-case.<type>.ts` |
| Types de fichiers | `.screen.tsx`, `.component.tsx`, `.service.ts`, `.model.ts` | `.handler.ts`, `.service.ts`, `.model.ts`, `.routes.ts` |
| Dossiers | `features/<nom>/screens,components,services,models/` | `features/<nom>/handlers,services,models,routes/` |
| Events Socket | — | `domain.action` (ex: `game.dices.roll`) |
| Routes REST | — | `/<feature>/<action>` (ex: `/auth/login`) |

---

## Diagramme de flux — Partie en ligne

```
Frontend (auth)          Backend (auth)
    │                        │
    ├── POST /auth/login ───▶│
    │◀── { token, user } ────│
    │                        │
Frontend (game)          Backend (matchmaking)
    │                        │
    ├── socket: queue.join ──▶│ matchmaking.handler → matchmaking.service
    │◀── socket: queue.added─│
    │                        │ (2e joueur arrive)
    │◀── socket: game.start ─│ matchmaking.service → game-session.service
    │                        │
Frontend (game)          Backend (game)
    │                        │
    ├── socket: game.dices.roll ──▶│ game.handler → game.service
    │◀── socket: game.deck.view-state ─│
    │◀── socket: game.choices.view-state ─│
    │                                     │
    ├── socket: game.grid.selected ──────▶│ game.handler → game.service → game-session
    │◀── socket: game.grid.view-state ────│
    │◀── socket: game.score ──────────────│
    │                                     │
    │◀── socket: game.end ────────────────│ game-session → history.service (sauvegarde)
```
