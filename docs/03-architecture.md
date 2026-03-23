# Architecture cible — Yam Master

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                  Expo / React Native                        │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │AuthScreen│  │OnlineGameScr.│  │  VsBotGameScreen      │ │
│  │          │  │  Controller  │  │    Controller          │ │
│  │  Login   │  │   ┌──────┐  │  │   ┌──────┐            │ │
│  │  Logout  │  │   │Board │  │  │   │Board │ (réutilisé)│ │
│  └──────────┘  │   └──────┘  │  │   └──────┘            │ │
│                └──────┬───────┘  └──────┬────────────────┘ │
│                       │                 │                   │
│            socket.io-client      socket.io-client           │
└───────────────────────┼─────────────────┼───────────────────┘
                        │    WebSocket    │
                        ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│              WEBSOCKET SERVER — Game Manager                │
│                Express / Node.js / Socket.IO                │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  game.service  │  │  bot.service   │  │   Stockage   │  │
│  │                │  │  (externalisé) │  │   (API REST  │  │
│  │  - init        │  │                │  │   ou intégré)│  │
│  │  - dices       │  │  - stratégie   │  │              │  │
│  │  - choices     │  │  - décision    │  │  - users     │  │
│  │  - grid        │  │  - niveaux     │  │  - parties   │  │
│  │  - scores      │  │                │  │  - scores    │  │
│  │  - victory     │  │                │  │              │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                              │                              │
│                    WebSocket (même API)                      │
│                              │                              │
│                    ┌─────────▼────────┐                     │
│                    │   BOT Client     │                     │
│                    │   (se connecte   │                     │
│                    │   comme un vrai  │                     │
│                    │   joueur)        │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Entités serveurs

### 1. WebSocket Server — Game Manager (imposé)

**Responsabilité** : Gestion des parties en temps réel.

| Composant | Rôle |
|-----------|------|
| `index.js` | Point d'entrée, gestion des connexions Socket.IO, orchestration |
| `services/game.service.js` | Moteur de jeu pur (sans side effects) : dés, combinaisons, grille, scores, victoire |
| `services/bot.service.js` | Logique décisionnelle du bot (externalisée du moteur) |

**Principe clé** : Le `game.service.js` doit rester une librairie de fonctions pures (entrée → sortie, sans état). Toute la gestion d'état est dans `index.js`.

### 2. Database Server — Stockage Service (au choix)

**Options** :
- **Option A** : Intégré au serveur Express (SQLite via `better-sqlite3`)
- **Option B** : Serveur séparé (API REST) avec MongoDB/PostgreSQL sous Docker

**Modèles de données minimum** :

```
User {
  id, username, passwordHash, createdAt
}

Game {
  id, player1Id, player2Id, winnerId,
  player1Score, player2Score,
  reason (alignment5 | noTokens),
  createdAt, duration
}
```

### 3. BOT Server — BOT Game Manager (au choix)

**Architecture** : Le bot se connecte au Game Manager **via WebSocket**, exactement comme un client humain. Cela permet :
- De réutiliser 100% de l'API existante
- De participer au tournoi inter-groupes
- De tester le bot comme un vrai joueur

**Flux** :
1. Frontend émet une demande de partie VsBot
2. Le serveur crée une partie et connecte un bot-client en interne
3. Le bot joue via les mêmes événements (`game.dices.roll`, `game.choices.selected`, `game.grid.selected`)

---

## Frontend — Hiérarchie des composants

```
<App>
  ├── <UserContext.Provider>          (contexte auth)
  │   ├── <SocketContext.Provider>    (connexion Socket.IO)
  │   │   ├── <AuthScreen>           (login/logout)
  │   │   ├── <MenuScreen>           (navigation)
  │   │   ├── <OnlineGameScreen>
  │   │   │   └── <OnlineGameController>
  │   │   │       ├── (écran file d'attente)
  │   │   │       ├── <Board>
  │   │   │       │   ├── <OpponentInfos>
  │   │   │       │   ├── <OpponentTimer>
  │   │   │       │   ├── <OpponentScore>
  │   │   │       │   ├── <OpponentTokens>
  │   │   │       │   ├── <OpponentDeck>
  │   │   │       │   ├── <Grid>
  │   │   │       │   ├── <Choices>
  │   │   │       │   ├── <PlayerDeck>
  │   │   │       │   ├── <PlayerScore>
  │   │   │       │   ├── <PlayerTokens>
  │   │   │       │   ├── <PlayerTimer>
  │   │   │       │   └── <PlayerInfos>
  │   │   │       └── (écran résumé fin de partie)
  │   │   └── <VsBotGameScreen>
  │   │       └── <VsBotGameController>
  │   │           ├── <Board>         (même composant réutilisé)
  │   │           └── (écran résumé fin de partie)
```

---

## Protocole WebSocket — Événements complets

### Client → Server

| Événement | Payload | Description |
|-----------|---------|-------------|
| `queue.join` | `{ userId? }` | Rejoindre la file d'attente |
| `game.dices.roll` | — | Lancer les dés |
| `game.dices.lock` | `idDice` | Verrouiller/déverrouiller un dé |
| `game.choices.selected` | `{ choiceId }` | Sélectionner une combinaison |
| `game.grid.selected` | `{ cellId, rowIndex, cellIndex }` | Poser un pion |
| `game.leave` | — | Quitter la partie |
| `disconnect` | — | Déconnexion |

### Server → Client

| Événement | Payload | Description |
|-----------|---------|-------------|
| `queue.added` | `{ inQueue, inGame }` | Confirmation file d'attente |
| `game.start` | `{ inQueue, inGame, idPlayer, idOpponent }` | Début de partie |
| `game.timer` | `{ playerTimer, opponentTimer }` | Timer chaque seconde |
| `game.deck.view-state` | `{ dices, rollsCounter, ... }` | État des dés |
| `game.choices.view-state` | `{ availableChoices, ... }` | Combinaisons disponibles |
| `game.grid.view-state` | `{ grid, canSelectCells }` | État de la grille |
| `game.score` | `{ playerScore, opponentScore, playerTokens, opponentTokens }` | Scores et pions (émis au start + après chaque pose) |
| `game.end` | `{ winner, reason, player1Score, player2Score }` | Fin de partie |
| `game.opponent.leave` | — | Adversaire déconnecté |
