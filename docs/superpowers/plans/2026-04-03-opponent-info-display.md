# Affichage informations adversaire — Plan d'implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher le vrai nom, avatar et rang de l'adversaire dans le board au lieu du placeholder "Opponent infos".

**Architecture:** Le backend enrichit le payload `game.start` avec un objet `opponent` contenant username, avatar et rang. Le frontend stocke ces infos dans un state et les passe en props jusqu'au composant `OpponentInfos`. Le rang est calcule cote backend via `ProfileService.computeRank()`.

**Tech Stack:** TypeScript (backend), React Native/TypeScript (frontend), Prisma (acces BDD pour le rang), Jest (tests)

---

## Structure des fichiers

| Fichier | Action | Responsabilite |
|---------|--------|----------------|
| `shared/types/socket-events.types.ts` | Modifier | Ajouter `OpponentInfo`, enrichir `GameStartPayload` |
| `backend/src/shared/types.ts` | Modifier | Ajouter `username` et `avatar` a `SocketLike` |
| `backend/src/infrastructure/socket.setup.ts` | Modifier | Stocker username + avatar sur le socket |
| `backend/src/features/game/services/game.service.ts` | Modifier | Enrichir `viewGameState()` avec `opponent` |
| `backend/src/features/matchmaking/handlers/matchmaking.handler.ts` | Modifier | Calculer le rang au start, passer a `viewGameState` |
| `backend/src/features/bot/handlers/bot.handler.ts` | Modifier | Ajouter username/avatar sur le bot socket |
| `frontend/src/features/game/controllers/online-game.controller.tsx` | Modifier | State `opponentInfo` |
| `frontend/src/features/game/controllers/vs-bot-game.controller.tsx` | Modifier | State `opponentInfo` |
| `frontend/src/features/game/components/board/board.component.tsx` | Modifier | Prop `opponentInfo` |
| `frontend/src/features/game/components/board/player-bar/opponent-infos.component.tsx` | Modifier | Props dynamiques au lieu du placeholder |
| `frontend/src/features/game/components/board/player-bar/player-infos.component.tsx` | Modifier | Bonus : avatar + rang du joueur |

---

## Task 1 : Types partages — OpponentInfo + GameStartPayload

**Files:**
- Modify: `shared/types/socket-events.types.ts:46-50`

- [ ] **Step 1: Ajouter l'interface OpponentInfo et enrichir GameStartPayload**

Dans `shared/types/socket-events.types.ts`, ajouter avant `GameStartPayload` :

```typescript
export interface OpponentInfo {
    username: string;
    avatar: string;
    rank: { name: string; tier: string; color: string } | null;
}
```

Et modifier `GameStartPayload` :

```typescript
export interface GameStartPayload {
    inQueue: boolean;
    inGame: boolean;
    idOpponent: string;
    opponent: OpponentInfo;
}
```

- [ ] **Step 2: Commit**

```bash
git add shared/types/socket-events.types.ts
git commit -m "feat: type OpponentInfo + enrichissement GameStartPayload"
```

---

## Task 2 : Backend — Stocker username et avatar sur le socket

**Files:**
- Modify: `backend/src/shared/types.ts:50-55`
- Modify: `backend/src/infrastructure/socket.setup.ts:103-107`
- Test: `backend/src/__tests__/infrastructure/socket.setup.test.ts`

- [ ] **Step 1: Ecrire le test qui verifie que username et avatar sont stockes sur le socket**

```typescript
describe('socket.setup - stockage username et avatar', () => {
    it('devrait stocker userId, username et avatar sur le socket a la connexion', () => {
        const mockSocket = createMockSocket({
            handshake: {
                query: {
                    userId: 'user-123',
                    username: 'TestPlayer',
                    avatar: '🎲',
                },
            },
        });

        // Simuler la connexion
        handleConnection(mockSocket);

        expect(mockSocket.userId).toBe('user-123');
        expect(mockSocket.username).toBe('TestPlayer');
        expect(mockSocket.avatar).toBe('🎲');
    });

    it('devrait utiliser des valeurs par defaut si username/avatar absents', () => {
        const mockSocket = createMockSocket({
            handshake: { query: { userId: 'user-123' } },
        });

        handleConnection(mockSocket);

        expect(mockSocket.username).toBeUndefined();
        expect(mockSocket.avatar).toBeUndefined();
    });
});
```

- [ ] **Step 2: Lancer le test pour verifier qu'il echoue**

```bash
cd backend && npm test -- --testPathPattern="socket.setup" --verbose
```

Attendu : FAIL (username/avatar non stockes)

- [ ] **Step 3: Ajouter username et avatar a l'interface SocketLike**

Dans `backend/src/shared/types.ts`, modifier `SocketLike` :

```typescript
export interface SocketLike {
    id: string;
    userId?: string;
    username?: string;
    avatar?: string;
    emit: (event: string, ...args: unknown[]) => void;
    on: (event: string, listener: (...args: unknown[]) => void) => void;
}
```

- [ ] **Step 4: Stocker username et avatar dans socket.setup.ts**

Dans `backend/src/infrastructure/socket.setup.ts`, apres la ligne qui stocke userId (ligne ~107), ajouter :

```typescript
const userId = socket.handshake.query.userId as string | undefined;
const username = socket.handshake.query.username as string | undefined;
const avatar = socket.handshake.query.avatar as string | undefined;

// Stocker les infos utilisateur dans le socket pour les handlers
(socket as unknown as Record<string, unknown>).userId = userId;
(socket as unknown as Record<string, unknown>).username = username;
(socket as unknown as Record<string, unknown>).avatar = avatar;
```

- [ ] **Step 5: Lancer le test pour verifier qu'il passe**

```bash
cd backend && npm test -- --testPathPattern="socket.setup" --verbose
```

Attendu : PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/shared/types.ts backend/src/infrastructure/socket.setup.ts backend/src/__tests__/infrastructure/socket.setup.test.ts
git commit -m "feat: stockage username et avatar sur le socket a la connexion"
```

---

## Task 3 : Backend — Enrichir viewGameState avec les infos adversaire

**Files:**
- Modify: `backend/src/features/game/services/game.service.ts:116-125`
- Test: `backend/src/__tests__/features/game/services/game.service.test.ts`

- [ ] **Step 1: Ecrire le test pour viewGameState avec opponent**

```typescript
describe('GameService.send.forPlayer.viewGameState', () => {
    it('devrait inclure les infos adversaire dans le payload', () => {
        const mockGame = createMockGame();
        mockGame.player1Socket.username = 'Player1';
        mockGame.player1Socket.avatar = '👑';
        mockGame.player2Socket.username = 'Player2';
        mockGame.player2Socket.avatar = '🔥';

        const opponentRank = { name: 'Or II', tier: 'II', color: '#ffd700' };

        const result = GameService.send.forPlayer.viewGameState('player:1', mockGame, opponentRank);

        expect(result.opponent).toEqual({
            username: 'Player2',
            avatar: '🔥',
            rank: opponentRank,
        });
        expect(result.idOpponent).toBe(mockGame.player2Socket.id);
    });

    it('devrait retourner les infos de player1 quand player2 demande', () => {
        const mockGame = createMockGame();
        mockGame.player1Socket.username = 'Player1';
        mockGame.player1Socket.avatar = '👑';
        mockGame.player2Socket.username = 'Player2';
        mockGame.player2Socket.avatar = '🔥';

        const opponentRank = { name: 'Argent I', tier: 'I', color: '#c0c0c0' };

        const result = GameService.send.forPlayer.viewGameState('player:2', mockGame, opponentRank);

        expect(result.opponent).toEqual({
            username: 'Player1',
            avatar: '👑',
            rank: opponentRank,
        });
    });

    it('devrait gerer le cas sans username/avatar (fallback)', () => {
        const mockGame = createMockGame();
        // Pas de username/avatar sur les sockets

        const result = GameService.send.forPlayer.viewGameState('player:1', mockGame, null);

        expect(result.opponent).toEqual({
            username: 'Adversaire',
            avatar: '🎲',
            rank: null,
        });
    });
});
```

- [ ] **Step 2: Lancer le test pour verifier qu'il echoue**

```bash
cd backend && npm test -- --testPathPattern="game.service" --verbose
```

Attendu : FAIL

- [ ] **Step 3: Implementer viewGameState enrichi**

Dans `backend/src/features/game/services/game.service.ts`, modifier `viewGameState` :

```typescript
viewGameState: (playerKey: PlayerKey, game: Game, opponentRank: { name: string; tier: string; color: string } | null = null) => {
    const isPlayer1 = playerKey === 'player:1';
    const opponentSocket = isPlayer1 ? game.player2Socket : game.player1Socket;

    return {
        inQueue: false,
        inGame: true,
        idPlayer: isPlayer1 ? game.player1Socket.id : game.player2Socket.id,
        idOpponent: opponentSocket.id,
        opponent: {
            username: opponentSocket.username ?? 'Adversaire',
            avatar: opponentSocket.avatar ?? '🎲',
            rank: opponentRank,
        },
    };
},
```

- [ ] **Step 4: Lancer le test pour verifier qu'il passe**

```bash
cd backend && npm test -- --testPathPattern="game.service" --verbose
```

Attendu : PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/game/services/game.service.ts backend/src/__tests__/features/game/services/game.service.test.ts
git commit -m "feat: viewGameState inclut les infos adversaire (username, avatar, rang)"
```

---

## Task 4 : Backend — Calculer le rang dans broadcastInitialState

**Files:**
- Modify: `backend/src/features/matchmaking/handlers/matchmaking.handler.ts:62-69`
- Test: `backend/src/__tests__/features/matchmaking/handlers/matchmaking.handler.test.ts`

- [ ] **Step 1: Ecrire le test d'integration pour broadcastInitialState avec rang**

```typescript
describe('broadcastInitialState', () => {
    it('devrait emettre game.start avec les infos adversaire incluant le rang', async () => {
        const mockGame = createMockGame();
        mockGame.player1Socket.userId = 'user-1';
        mockGame.player1Socket.username = 'Player1';
        mockGame.player1Socket.avatar = '👑';
        mockGame.player2Socket.userId = 'user-2';
        mockGame.player2Socket.username = 'Player2';
        mockGame.player2Socket.avatar = '🔥';

        // Mock ProfileService pour retourner un rang
        jest.spyOn(ProfileService, 'getWinsCount').mockResolvedValueOnce(10).mockResolvedValueOnce(25);

        await broadcastInitialState(mockGame);

        const player1Payload = (mockGame.player1Socket.emit as jest.Mock).mock.calls
            .find((call: unknown[]) => call[0] === 'game.start')?.[1];

        expect(player1Payload.opponent.username).toBe('Player2');
        expect(player1Payload.opponent.avatar).toBe('🔥');
        expect(player1Payload.opponent.rank).toBeDefined();
        expect(player1Payload.opponent.rank.name).toContain('Or'); // 25 wins = Or
    });
});
```

- [ ] **Step 2: Lancer le test pour verifier qu'il echoue**

```bash
cd backend && npm test -- --testPathPattern="matchmaking.handler" --verbose
```

Attendu : FAIL

- [ ] **Step 3: Rendre broadcastInitialState async et ajouter le calcul du rang**

Dans `backend/src/features/matchmaking/handlers/matchmaking.handler.ts`, modifier `broadcastInitialState` :

```typescript
import { computeRank } from '../../profile/services/profile.service';
import { prisma } from '../../../infrastructure/database';

const getWinsCount = async (userId: string | undefined): Promise<number> => {
    if (!userId) return 0;
    return prisma.gamePlayer.count({
        where: { userId, result: 'WIN' },
    });
};

const broadcastInitialState = async (game: Game): Promise<void> => {
    try {
        const [player1Wins, player2Wins] = await Promise.all([
            getWinsCount(game.player2Socket.userId),
            getWinsCount(game.player1Socket.userId),
        ]);

        const player2Rank = computeRank(player1Wins);
        const player1Rank = computeRank(player2Wins);

        game.player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', game, player2Rank));
        game.player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', game, player1Rank));
        updateClientsViewTimers(game);
        updateClientsViewDecks(game);
        updateClientsViewGrid(game);
        updateClientsViewScores(game);
    } catch (error) {
        logger.error('[MATCHMAKING] Erreur calcul rang au start', { error });
        // Fallback sans rang
        game.player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', game, null));
        game.player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', game, null));
        updateClientsViewTimers(game);
        updateClientsViewDecks(game);
        updateClientsViewGrid(game);
        updateClientsViewScores(game);
    }
};
```

**Note** : bien verifier que `computeRank` est exporte depuis `profile.service.ts`. Si ce n'est pas le cas, ajouter l'export.

- [ ] **Step 4: Mettre a jour les appels a broadcastInitialState (ajouter await)**

Dans le meme fichier, les appels a `broadcastInitialState(game)` doivent devenir `await broadcastInitialState(game)`. Chercher tous les appels dans le fichier et ajouter `await`.

- [ ] **Step 5: Lancer le test pour verifier qu'il passe**

```bash
cd backend && npm test -- --testPathPattern="matchmaking.handler" --verbose
```

Attendu : PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/features/matchmaking/handlers/matchmaking.handler.ts backend/src/__tests__/features/matchmaking/handlers/matchmaking.handler.test.ts
git commit -m "feat: calcul du rang adversaire dans broadcastInitialState"
```

---

## Task 5 : Backend — Infos bot statiques

**Files:**
- Modify: `backend/src/features/bot/handlers/bot.handler.ts`
- Test: `backend/src/__tests__/features/bot/handlers/bot.handler.test.ts`

- [ ] **Step 1: Ecrire le test pour le bot socket avec username et avatar**

```typescript
describe('createBotSocket', () => {
    it('devrait creer un socket bot avec username et avatar', () => {
        const botSocket = createBotSocket('MEDIUM');

        expect(botSocket.id).toMatch(/^bot-/);
        expect(botSocket.username).toBe('Bot Tactique');
        expect(botSocket.avatar).toBe('🤖');
    });

    it('devrait adapter le nom selon la difficulte', () => {
        expect(createBotSocket('EASY').username).toBe('Bot Debutant');
        expect(createBotSocket('MEDIUM').username).toBe('Bot Tactique');
        expect(createBotSocket('HARD').username).toBe('Bot Maitre IA');
    });
});
```

- [ ] **Step 2: Lancer le test pour verifier qu'il echoue**

```bash
cd backend && npm test -- --testPathPattern="bot.handler" --verbose
```

Attendu : FAIL

- [ ] **Step 3: Modifier createBotSocket pour inclure username et avatar**

Dans `backend/src/features/bot/handlers/bot.handler.ts`, modifier `createBotSocket` :

```typescript
const BOT_NAMES: Record<string, string> = {
    EASY: 'Bot Debutant',
    MEDIUM: 'Bot Tactique',
    HARD: 'Bot Maitre IA',
};

export const createBotSocket = (difficulty: string = 'MEDIUM'): SocketLike => {
    const emitter = new EventEmitter();
    return {
        id: 'bot-' + uniqid(),
        username: BOT_NAMES[difficulty] ?? 'Bot',
        avatar: '🤖',
        emit: (event: string, ...args: unknown[]) => emitter.emit(event, ...args),
        on: (event: string, listener: (...args: unknown[]) => void) => { emitter.on(event, listener); },
    };
};
```

Mettre a jour l'appel a `createBotSocket` pour passer la difficulte en parametre.

- [ ] **Step 4: Lancer le test pour verifier qu'il passe**

```bash
cd backend && npm test -- --testPathPattern="bot.handler" --verbose
```

Attendu : PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/bot/handlers/bot.handler.ts backend/src/__tests__/features/bot/handlers/bot.handler.test.ts
git commit -m "feat: bot socket avec username selon difficulte et avatar robot"
```

---

## Task 6 : Frontend — State opponentInfo dans les controllers

**Files:**
- Modify: `frontend/src/features/game/controllers/online-game.controller.tsx`
- Modify: `frontend/src/features/game/controllers/vs-bot-game.controller.tsx`
- Test: `frontend/src/__tests__/features/game/controllers/online-game.controller.test.tsx`
- Test: `frontend/src/__tests__/features/game/controllers/vs-bot-game.controller.test.tsx`

- [ ] **Step 1: Ecrire le test pour online-game.controller**

```typescript
import { OpponentInfo } from '../../../../shared/types/socket-events.types';

describe('OnlineGameController', () => {
    it('devrait stocker opponentInfo apres game.start et le passer a Board', async () => {
        const mockOpponent: OpponentInfo = {
            username: 'Adversaire1',
            avatar: '👑',
            rank: { name: 'Or II', tier: 'II', color: '#ffd700' },
        };

        // Simuler game.start avec opponent
        socketEmit('game.start', {
            inQueue: false,
            inGame: true,
            idOpponent: 'socket-123',
            opponent: mockOpponent,
        });

        // Verifier que Board recoit opponentInfo
        const board = screen.getByTestId('board');
        expect(board.props.opponentInfo).toEqual(mockOpponent);
    });
});
```

- [ ] **Step 2: Lancer le test pour verifier qu'il echoue**

```bash
cd frontend && npm test -- --testPathPattern="online-game.controller" --verbose
```

Attendu : FAIL

- [ ] **Step 3: Ajouter le state opponentInfo dans online-game.controller**

Dans `frontend/src/features/game/controllers/online-game.controller.tsx`, ajouter :

```typescript
import { OpponentInfo, GameStartPayload } from '../../../../shared/types/socket-events.types';

// Dans le composant :
const [opponentInfo, setOpponentInfo] = useState<OpponentInfo | null>(null);

const onGameStart = (data: GameStartPayload): void => {
    setInQueue(data.inQueue);
    setInGame(data.inGame);
    setOpponentInfo(data.opponent);
    setGameResult(null);
};

// Dans le rendu :
if (inGame) {
    return <Board opponentInfo={opponentInfo} />;
}
```

- [ ] **Step 4: Appliquer le meme changement dans vs-bot-game.controller**

Dans `frontend/src/features/game/controllers/vs-bot-game.controller.tsx`, meme pattern :

```typescript
import { OpponentInfo, GameStartPayload } from '../../../../shared/types/socket-events.types';

const [opponentInfo, setOpponentInfo] = useState<OpponentInfo | null>(null);

const onGameStart = (data: GameStartPayload): void => {
    setInGame(data.inGame);
    setOpponentInfo(data.opponent);
    setGameResult(null);
};

if (inGame) {
    return <Board opponentInfo={opponentInfo} />;
}
```

- [ ] **Step 5: Lancer les tests pour verifier qu'ils passent**

```bash
cd frontend && npm test -- --testPathPattern="(online-game|vs-bot-game).controller" --verbose
```

Attendu : PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/game/controllers/online-game.controller.tsx frontend/src/features/game/controllers/vs-bot-game.controller.tsx frontend/src/__tests__/features/game/controllers/
git commit -m "feat: state opponentInfo dans les controllers online et vs-bot"
```

---

## Task 7 : Frontend — Board transmet opponentInfo

**Files:**
- Modify: `frontend/src/features/game/components/board/board.component.tsx`
- Test: `frontend/src/__tests__/features/game/components/board/board.component.test.tsx`

- [ ] **Step 1: Ecrire le test**

```typescript
describe('Board', () => {
    it('devrait transmettre opponentInfo a OpponentInfos', () => {
        const opponentInfo = {
            username: 'TestOpponent',
            avatar: '🔥',
            rank: { name: 'Argent III', tier: 'III', color: '#c0c0c0' },
        };

        render(<Board opponentInfo={opponentInfo} />);

        expect(screen.getByText('TestOpponent')).toBeTruthy();
        expect(screen.getByText('🔥')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Lancer le test pour verifier qu'il echoue**

```bash
cd frontend && npm test -- --testPathPattern="board.component" --verbose
```

Attendu : FAIL

- [ ] **Step 3: Modifier BoardProps et passer opponentInfo**

Dans `frontend/src/features/game/components/board/board.component.tsx` :

```typescript
import { OpponentInfo } from '../../../../../shared/types/socket-events.types';

interface BoardProps {
    _gameViewState?: Record<string, unknown>;
    opponentInfo?: OpponentInfo | null;
}

// Dans le composant :
const Board: React.FC<BoardProps> = ({ opponentInfo }) => {
    // ...

    // Dans le rendu, remplacer <OpponentInfos /> par :
    <OpponentInfos
        username={opponentInfo?.username}
        avatar={opponentInfo?.avatar}
        rank={opponentInfo?.rank}
    />
    // ...
};
```

- [ ] **Step 4: Lancer le test pour verifier qu'il passe**

```bash
cd frontend && npm test -- --testPathPattern="board.component" --verbose
```

Attendu : PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/game/components/board/board.component.tsx frontend/src/__tests__/features/game/components/board/board.component.test.tsx
git commit -m "feat: Board transmet opponentInfo a OpponentInfos"
```

---

## Task 8 : Frontend — OpponentInfos dynamique

**Files:**
- Modify: `frontend/src/features/game/components/board/player-bar/opponent-infos.component.tsx`
- Test: `frontend/src/__tests__/features/game/components/board/player-bar/opponent-infos.component.test.tsx`

- [ ] **Step 1: Ecrire les tests**

```typescript
describe('OpponentInfos', () => {
    it('devrait afficher le username de l adversaire', () => {
        render(<OpponentInfos username="Sam2" avatar="👑" rank={null} />);

        expect(screen.getByText('Sam2')).toBeTruthy();
        expect(screen.getByText('ADVERSAIRE')).toBeTruthy();
    });

    it('devrait afficher l avatar emoji au lieu de l icone generique', () => {
        render(<OpponentInfos username="Sam2" avatar="🔥" rank={null} />);

        expect(screen.getByText('🔥')).toBeTruthy();
    });

    it('devrait afficher le rang quand il est fourni', () => {
        const rank = { name: 'Or II', tier: 'II', color: '#ffd700' };
        render(<OpponentInfos username="Sam2" avatar="👑" rank={rank} />);

        expect(screen.getByText('Or II')).toBeTruthy();
    });

    it('devrait ne pas afficher le rang pour un bot (rank null)', () => {
        render(<OpponentInfos username="Bot Tactique" avatar="🤖" rank={null} />);

        expect(screen.getByText('Bot Tactique')).toBeTruthy();
        expect(screen.queryByTestId('opponent-rank')).toBeNull();
    });

    it('devrait afficher le fallback quand pas de props', () => {
        render(<OpponentInfos />);

        expect(screen.getByText('Adversaire')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Lancer les tests pour verifier qu'ils echouent**

```bash
cd frontend && npm test -- --testPathPattern="opponent-infos" --verbose
```

Attendu : FAIL

- [ ] **Step 3: Implementer le composant OpponentInfos avec props**

Remplacer le contenu de `frontend/src/features/game/components/board/player-bar/opponent-infos.component.tsx` :

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../../../../shared/theme/colors';

interface OpponentInfosProps {
    username?: string;
    avatar?: string;
    rank?: { name: string; tier: string; color: string } | null;
}

const OpponentInfos: React.FC<OpponentInfosProps> = ({
    username = 'Adversaire',
    avatar,
    rank,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.avatarBorder}>
                <View style={styles.avatar}>
                    {avatar ? (
                        <Text style={styles.avatarEmoji}>{avatar}</Text>
                    ) : (
                        <Feather name="user" size={14} color="rgba(255,255,255,0.2)" />
                    )}
                </View>
            </View>
            <View>
                <Text style={styles.label}>ADVERSAIRE</Text>
                <Text style={styles.username}>{username}</Text>
                {rank && (
                    <Text testID="opponent-rank" style={[styles.rank, { color: rank.color }]}>
                        {rank.name}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarBorder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: {
        fontSize: 16,
    },
    label: {
        fontSize: 9,
        fontWeight: '600',
        color: colors.accent,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    username: {
        fontSize: 13,
        fontWeight: '700',
        color: '#ffffff',
    },
    rank: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 1,
    },
});

export default OpponentInfos;
```

- [ ] **Step 4: Lancer les tests pour verifier qu'ils passent**

```bash
cd frontend && npm test -- --testPathPattern="opponent-infos" --verbose
```

Attendu : PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/game/components/board/player-bar/opponent-infos.component.tsx frontend/src/__tests__/features/game/components/board/player-bar/opponent-infos.component.test.tsx
git commit -m "feat: OpponentInfos affiche username, avatar et rang de l'adversaire"
```

---

## Task 9 : Frontend — PlayerInfos avec avatar et rang (bonus coherence)

**Files:**
- Modify: `frontend/src/features/game/components/board/player-bar/player-infos.component.tsx`
- Test: `frontend/src/__tests__/features/game/components/board/player-bar/player-infos.component.test.tsx`

- [ ] **Step 1: Ecrire les tests**

```typescript
describe('PlayerInfos', () => {
    it('devrait afficher le username du joueur connecte', () => {
        // Mock useAuth avec user { username: 'Sam', avatar: '🎲' }
        render(<PlayerInfos />);

        expect(screen.getByText('Sam')).toBeTruthy();
    });

    it('devrait afficher l avatar emoji du joueur', () => {
        render(<PlayerInfos />);

        expect(screen.getByText('🎲')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Lancer les tests pour verifier qu'ils echouent**

```bash
cd frontend && npm test -- --testPathPattern="player-infos" --verbose
```

Attendu : FAIL

- [ ] **Step 3: Modifier PlayerInfos pour afficher l'avatar**

Dans `frontend/src/features/game/components/board/player-bar/player-infos.component.tsx`, modifier le rendu de l'avatar :

```typescript
const PlayerInfos: React.FC = () => {
    const { user } = useAuth();
    const username = user?.username ?? 'Joueur';
    const avatar = user?.avatar;

    return (
        <View style={styles.container}>
            <View style={styles.avatarBorder}>
                <View style={styles.avatar}>
                    {avatar ? (
                        <Text style={styles.avatarEmoji}>{avatar}</Text>
                    ) : (
                        <Feather name="user" size={14} color={colors.textSecondary} />
                    )}
                </View>
            </View>
            <View>
                <Text style={styles.label}>VOUS</Text>
                <Text style={styles.username}>{username}</Text>
            </View>
        </View>
    );
};
```

Ajouter le style `avatarEmoji` :
```typescript
avatarEmoji: {
    fontSize: 16,
},
```

- [ ] **Step 4: Lancer les tests pour verifier qu'ils passent**

```bash
cd frontend && npm test -- --testPathPattern="player-infos" --verbose
```

Attendu : PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/game/components/board/player-bar/player-infos.component.tsx frontend/src/__tests__/features/game/components/board/player-bar/player-infos.component.test.tsx
git commit -m "feat: PlayerInfos affiche l'avatar emoji du joueur connecte"
```

---

## Task 10 : Frontend — Transmettre avatar dans le handshake socket

**Files:**
- Modify: `frontend/src/shared/contexts/socket.context.tsx` (ou le fichier qui cree la connexion socket)

- [ ] **Step 1: Verifier le fichier de connexion socket et ajouter avatar au handshake**

Dans le fichier qui initialise la connexion Socket.IO (probablement `socket.context.tsx`), ajouter `avatar` dans les query params du handshake :

```typescript
const socket = io(serverUrl, {
    query: {
        userId: user?.id,
        username: user?.username,
        avatar: user?.avatar,  // Ajouter cette ligne
    },
});
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/shared/contexts/socket.context.tsx
git commit -m "feat: transmet avatar dans le handshake socket"
```

---

## Task 11 : Validation globale — Tests complets + lint

- [ ] **Step 1: Lancer tous les tests backend**

```bash
cd backend && npm test -- --verbose
```

Attendu : tous PASS

- [ ] **Step 2: Lancer tous les tests frontend**

```bash
cd frontend && npm test -- --verbose
```

Attendu : tous PASS

- [ ] **Step 3: Lancer le lint backend**

```bash
cd backend && npm run lint
```

Attendu : 0 erreur, 0 warning

- [ ] **Step 4: Lancer le lint frontend**

```bash
cd frontend && npm run lint
```

Attendu : 0 erreur, 0 warning

- [ ] **Step 5: Corriger toute erreur de lint ou test**

Si des erreurs apparaissent, les corriger et relancer.

- [ ] **Step 6: Commit final si corrections**

```bash
git add -A
git commit -m "fix: corrections lint et tests apres integration opponent info"
```
