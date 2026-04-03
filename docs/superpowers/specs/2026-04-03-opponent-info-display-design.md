# Spec — Affichage des informations adversaire

## Probleme

Le composant `OpponentInfos` affiche "Opponent infos" en dur au lieu du vrai nom, avatar et rang de l'adversaire. Le backend ne transmet pas ces donnees dans l'evenement `game.start`, et le frontend n'a aucun state pour les stocker.

## Solution

Enrichir le payload `game.start` avec les informations de l'adversaire (username, avatar, rang) et les afficher dans le composant `OpponentInfos`.

## Approche retenue

**Approche A — Enrichir `game.start`** : le backend inclut les infos adversaire directement dans le payload de `game.start`. Pas d'appel REST supplementaire cote frontend.

---

## Backend

### 1. Stockage des infos sur le socket

**Fichier** : `backend/src/infrastructure/socket.setup.ts`

A la connexion, stocker `username` et `avatar` sur le socket en plus de `userId` (deja fait) :

```typescript
(socket as unknown as Record<string, unknown>).userId = userId;
(socket as unknown as Record<string, unknown>).username = username;
(socket as unknown as Record<string, unknown>).avatar = avatar;
```

Le `avatar` est transmis dans le handshake query par le frontend (a ajouter cote frontend si pas deja fait).

### 2. Enrichissement du payload `game.start`

**Fichier** : `backend/src/features/game/services/game.service.ts`

La methode `viewGameState()` ajoute un objet `opponent` dans le payload :

```typescript
{
  inQueue: false,
  inGame: true,
  idPlayer: "socket-id",
  idOpponent: "socket-id",
  opponent: {
    username: "Sam2",
    avatar: "🎲",
    rank: { tier: "Or", division: "II", label: "Or II" }
  }
}
```

### 3. Calcul du rang

**Fichier** : `backend/src/features/matchmaking/handlers/matchmaking.handler.ts`

Au moment de `broadcastInitialState`, appeler `ProfileService.computeRank()` avec le `userId` de l'adversaire pour obtenir le rang. Un seul appel BDD par joueur au demarrage de la partie.

### 4. Cas bot

Le bot n'a pas de profil en BDD. Infos statiques :
```typescript
{ username: "Bot", avatar: "🤖", rank: null }
```

Le niveau de difficulte peut etre inclus dans le username : "Bot Debutant", "Bot Tactique", "Bot Maitre IA".

---

## Types partages

**Fichier** : `shared/types/socket-events.types.ts`

Nouveau type :
```typescript
export interface OpponentInfo {
  username: string;
  avatar: string;
  rank: { tier: string; division: string; label: string } | null;
}
```

Extension de `GameStartPayload` :
```typescript
export interface GameStartPayload {
  inQueue: boolean;
  inGame: boolean;
  idOpponent: string;
  opponent: OpponentInfo;
}
```

---

## Frontend

### 1. Controllers

**Fichiers** :
- `frontend/src/features/game/controllers/online-game.controller.tsx`
- `frontend/src/features/game/controllers/vs-bot-game.controller.tsx`

Ajouter un state :
```typescript
const [opponentInfo, setOpponentInfo] = useState<OpponentInfo | null>(null);
```

Dans `onGameStart` :
```typescript
setOpponentInfo(data.opponent);
```

Passer `opponentInfo` en prop a `<Board>`.

### 2. Board

**Fichier** : `frontend/src/features/game/components/board/board.component.tsx`

Accepter `opponentInfo` en prop et le transmettre a `<OpponentInfos>`.

### 3. OpponentInfos

**Fichier** : `frontend/src/features/game/components/board/player-bar/opponent-infos.component.tsx`

Le composant accepte des props :
```typescript
interface OpponentInfosProps {
  username?: string;
  avatar?: string;
  rank?: { tier: string; division: string; label: string } | null;
}
```

Affichage :
- **Avatar** : emoji du joueur (remplace l'icone Feather generique), fallback sur l'icone si pas d'avatar
- **Username** : nom reel (remplace "Opponent infos"), fallback "Adversaire"
- **Rang** : affiche sous le label "ADVERSAIRE" (ex: "Or II"), masque si `rank` est null

### 4. PlayerInfos (bonus coherence)

Meme traitement pour le joueur connecte : afficher son avatar et rang dans `PlayerInfos` en utilisant les donnees du `AuthContext`. Pas de changement backend necessaire pour ca.

---

## Tests

### Backend
- **Unitaire** : `GameService.send.forPlayer.viewGameState()` retourne `opponent` avec les bonnes infos
- **Unitaire** : infos bot statiques quand le socket est un bot
- **Integration** : `broadcastInitialState` emet les infos adversaire correctes via mock sockets

### Frontend
- **Unitaire** : `OpponentInfos` affiche le username, avatar et rang passes en props
- **Unitaire** : `OpponentInfos` affiche le fallback quand pas de props
- **Integration** : le controller stocke `opponentInfo` apres `game.start` et le passe au Board

---

## Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `shared/types/socket-events.types.ts` | Ajout `OpponentInfo`, extension `GameStartPayload` |
| `backend/src/infrastructure/socket.setup.ts` | Stocker `username` + `avatar` sur le socket |
| `backend/src/features/game/services/game.service.ts` | Enrichir `viewGameState()` avec `opponent` |
| `backend/src/features/matchmaking/handlers/matchmaking.handler.ts` | Calculer le rang au start |
| `backend/src/features/bot/handlers/bot.handler.ts` | Infos bot statiques |
| `frontend/src/features/game/controllers/online-game.controller.tsx` | State `opponentInfo` |
| `frontend/src/features/game/controllers/vs-bot-game.controller.tsx` | State `opponentInfo` |
| `frontend/src/features/game/components/board/board.component.tsx` | Prop `opponentInfo` |
| `frontend/src/features/game/components/board/player-bar/opponent-infos.component.tsx` | Props + affichage reel |
| `frontend/src/features/game/components/board/player-bar/player-infos.component.tsx` | Bonus : avatar + rang du joueur |
