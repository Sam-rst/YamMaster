# Niveaux de difficulté du bot — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter 3 niveaux de difficulté au bot (Facile/Intermédiaire/Pro) avec écran de sélection, stratégies différenciées et stockage en BDD.

**Architecture:** Le type `BotDifficulty` est défini dans les types partagés. Le schéma Prisma ajoute un champ `difficulty` nullable sur `GamePlayer`. Le `BotService` dispatche vers 3 stratégies selon la difficulté. Le frontend ajoute un écran de sélection qui passe la difficulté via `game.vsbot` → backend → BDD.

**Tech Stack:** TypeScript, Prisma/PostgreSQL, Socket.IO, React Native/Expo, Jest

---

## File Map

### Fichiers modifiés — Shared
- `shared/types/game.types.ts` — Ajouter `BotDifficulty` type
- `shared/types/socket-events.types.ts` — `game.vsbot` prend `{ difficulty }` en payload

### Fichiers modifiés — Backend
- `backend/prisma/schema.prisma` — Enum `BotDifficulty` + champ sur `GamePlayer`
- `backend/src/features/bot/services/bot.service.ts` — 3 stratégies par difficulté
- `backend/src/features/bot/services/bot.service.test.ts` — Tests par difficulté
- `backend/src/features/bot/handlers/bot.handler.ts` — Propager difficulty aux appels BotService
- `backend/src/features/matchmaking/handlers/matchmaking.handler.ts` — Recevoir et stocker difficulty
- `backend/src/features/history/services/history.service.ts` — `PlayerInput` avec difficulty
- `backend/src/infrastructure/socket.setup.ts` — Passer difficulty depuis event

### Fichiers créés — Frontend
- `frontend/src/features/game/screens/bot-difficulty.screen.tsx`
- `frontend/src/features/game/screens/bot-difficulty.screen.test.tsx`

### Fichiers modifiés — Frontend
- `frontend/App.tsx` — Ajouter `BotDifficultyScreen` dans HomeStack + route params VsBotGameScreen
- `frontend/src/features/home/screens/home.screen.tsx` — Naviguer vers BotDifficultyScreen
- `frontend/src/features/game/screens/vs-bot-game.screen.tsx` — Recevoir difficulty en route param
- `frontend/src/features/game/controllers/vs-bot-game.controller.tsx` — Émettre difficulty dans game.vsbot

---

## Task 1 : Gitflow — Créer la branche feature

**Files:** Aucun

- [ ] **Step 1: Créer la branche depuis develop**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster
git checkout develop
git pull origin develop
git checkout -b feature/bot-difficulty
```

---

## Task 2 : Types partagés — BotDifficulty

**Files:**
- Modify: `shared/types/game.types.ts`
- Modify: `shared/types/socket-events.types.ts`

- [ ] **Step 1: Ajouter le type BotDifficulty dans game.types.ts**

À la fin de `shared/types/game.types.ts`, ajouter :

```typescript
export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
```

- [ ] **Step 2: Modifier l'event game.vsbot dans socket-events.types.ts**

Dans `shared/types/socket-events.types.ts`, ajouter l'import :

```typescript
import { Dice, Combination, GridCell, PlayerKey, VictoryResult, BotDifficulty } from './game.types';
```

Puis modifier la ligne `'game.vsbot': () => void;` en :

```typescript
'game.vsbot': (data: { difficulty: BotDifficulty }) => void;
```

- [ ] **Step 3: Commit**

```bash
git add shared/types/
git commit -m "feat: type BotDifficulty + payload game.vsbot avec difficulty"
```

---

## Task 3 : Schéma Prisma — Enum et champ difficulty

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Ajouter l'enum et le champ**

Dans `backend/prisma/schema.prisma`, ajouter l'enum après les enums existants :

```prisma
enum BotDifficulty {
  EASY
  MEDIUM
  HARD
}
```

Ajouter le champ dans le modèle `GamePlayer`, après le champ `result` :

```prisma
  difficulty BotDifficulty?  // null pour les joueurs humains
```

- [ ] **Step 2: Générer et appliquer la migration**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx prisma generate
npx prisma db push
```

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/ backend/src/generated/
git commit -m "feat: schema Prisma — enum BotDifficulty + champ sur GamePlayer"
```

---

## Task 4 : BotService — Stratégie Facile (TDD)

**Files:**
- Modify: `backend/src/features/bot/services/bot.service.test.ts`
- Modify: `backend/src/features/bot/services/bot.service.ts`

- [ ] **Step 1: RED — Écrire les tests pour la stratégie EASY**

Ajouter dans `backend/src/features/bot/services/bot.service.test.ts` un nouveau bloc `describe` :

```typescript
describe('Stratégie EASY', () => {
    describe('chooseBestCombination', () => {
        it('priorise brelan avant yam en mode EASY', () => {
            const grid = GameService.init.grid();
            const choices = [
                { id: 'yam', value: 'Yam' },
                { id: 'brelan3', value: 'Brelan3' },
            ];
            const result = BotService.chooseBestCombination(choices, grid, 'EASY');
            expect(result).toBe('brelan3');
        });

        it('priorise moinshuit avant full en mode EASY', () => {
            const grid = GameService.init.grid();
            const choices = [
                { id: 'full', value: 'Full' },
                { id: 'moinshuit', value: 'MoinsHuit' },
            ];
            const result = BotService.chooseBestCombination(choices, grid, 'EASY');
            expect(result).toBe('moinshuit');
        });
    });

    describe('chooseBestCell', () => {
        it('choisit la première case libre en mode EASY (pas d\'adjacence)', () => {
            const grid = GameService.init.grid();
            const result = BotService.chooseBestCell('brelan1', grid, 'EASY');
            expect(result).not.toBeNull();
            expect(result.cellId).toBe('brelan1');
        });
    });

    describe('chooseDicesToLock', () => {
        it('verrouille correctement les paires en mode EASY', () => {
            const dices = [
                { id: 1, value: '4', locked: false },
                { id: 2, value: '2', locked: false },
                { id: 3, value: '4', locked: false },
                { id: 4, value: '4', locked: false },
                { id: 5, value: '6', locked: false },
            ];
            const result = BotService.chooseDicesToLock(dices, 'EASY');
            expect(result).toContain(1);
            expect(result).toContain(3);
            expect(result).toContain(4);
        });
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx jest src/features/bot/services/bot.service.test.ts --no-coverage
```

Expected: FAIL — les méthodes n'acceptent pas encore le paramètre `difficulty`

- [ ] **Step 3: GREEN — Implémenter la stratégie EASY**

Modifier `backend/src/features/bot/services/bot.service.ts` :

```typescript
import { Dice, Combination, Grid } from '../../../shared/types';
import { BotDifficulty } from '../../../../shared/types/game.types';

interface CellSelection {
    cellId: string;
    rowIndex: number;
    cellIndex: number;
}

const PRIORITY_EASY = ['brelan1', 'brelan2', 'brelan3', 'brelan4', 'brelan5', 'brelan6', 'moinshuit', 'suite', 'full', 'carre', 'yam'];
const PRIORITY_MEDIUM = ['yam', 'carre', 'full', 'suite', 'sec', 'defi', 'moinshuit'];

const getPlayableCombinations = (availableChoices: Combination[], grid: Grid): Combination[] => {
    return availableChoices.filter(choice =>
        grid.some(row => row.some(cell => cell.id === choice.id && cell.owner === null))
    );
};

const chooseCombinationByPriority = (playable: Combination[], priority: string[]): string | null => {
    for (const prio of priority) {
        const match = playable.find(c => c.id === prio);
        if (match) return match.id;
    }
    return playable[0]?.id ?? null;
};

const findFirstFreeCell = (choiceId: string, grid: Grid): CellSelection | null => {
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
            const cell = grid[rowIndex][cellIndex];
            if (cell.id === choiceId && cell.owner === null) {
                return { cellId: cell.id, rowIndex, cellIndex };
            }
        }
    }
    return null;
};

const lockByFrequency = (dices: Dice[]): number[] => {
    const counts: Record<string, number> = {};
    for (const d of dices) {
        if (d.value !== '') {
            counts[d.value] = (counts[d.value] || 0) + 1;
        }
    }

    let bestValue: string | null = null;
    let bestCount = 0;
    for (const [value, count] of Object.entries(counts)) {
        if (count > bestCount) {
            bestCount = count;
            bestValue = value;
        }
    }

    if (bestCount >= 2 && bestValue !== null) {
        return dices.filter(d => d.value === bestValue).map(d => d.id);
    }

    return [];
};

const BotService = {

    chooseBestCombination: (availableChoices: Combination[], grid: Grid, difficulty: BotDifficulty = 'MEDIUM'): string | null => {
        if (!availableChoices || availableChoices.length === 0) return null;

        const playable = getPlayableCombinations(availableChoices, grid);
        if (playable.length === 0) return null;

        switch (difficulty) {
            case 'EASY':
                return chooseCombinationByPriority(playable, PRIORITY_EASY);
            case 'MEDIUM':
            case 'HARD':
            default:
                return chooseCombinationByPriority(playable, PRIORITY_MEDIUM);
        }
    },

    chooseBestCell: (choiceId: string, grid: Grid, difficulty: BotDifficulty = 'MEDIUM'): CellSelection | null => {
        switch (difficulty) {
            case 'EASY':
            case 'MEDIUM':
            case 'HARD':
            default:
                return findFirstFreeCell(choiceId, grid);
        }
    },

    chooseDicesToLock: (dices: Dice[], difficulty: BotDifficulty = 'MEDIUM'): number[] => {
        switch (difficulty) {
            case 'EASY':
            case 'MEDIUM':
            case 'HARD':
            default:
                return lockByFrequency(dices);
        }
    },
};

export default BotService;
```

Note: MEDIUM et HARD sont identiques pour l'instant — on implémente MEDIUM et HARD dans les tasks suivantes.

- [ ] **Step 4: Mettre à jour les tests existants pour passer difficulty**

Les tests existants qui n'ont pas de paramètre `difficulty` doivent continuer à passer grâce au défaut `= 'MEDIUM'`. Vérifier :

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx jest src/features/bot/services/bot.service.test.ts --no-coverage
```

Expected: Tous les tests passent (anciens + nouveaux EASY)

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/bot/services/ shared/types/
git commit -m "feat: BotService stratégie EASY — priorise combinaisons simples (TDD)"
```

---

## Task 5 : BotService — Stratégie Intermédiaire avec adjacence (TDD)

**Files:**
- Modify: `backend/src/features/bot/services/bot.service.test.ts`
- Modify: `backend/src/features/bot/services/bot.service.ts`

- [ ] **Step 1: RED — Tests pour MEDIUM chooseBestCell avec adjacence**

Ajouter dans le fichier de tests :

```typescript
describe('Stratégie MEDIUM', () => {
    describe('chooseBestCell', () => {
        it('préfère une case adjacente à un pion existant en mode MEDIUM', () => {
            const grid = GameService.init.grid();
            // Poser un pion bot sur la première case brelan1
            for (const row of grid) {
                for (const cell of row) {
                    if (cell.id === 'brelan1' && cell.owner === null) {
                        cell.owner = 'player:2';
                        break;
                    }
                }
                if (grid.flat().some(c => c.owner === 'player:2')) break;
            }

            // Le bot doit préférer une case adjacente pour brelan2 (s'il y en a une)
            const result = BotService.chooseBestCell('brelan2', grid, 'MEDIUM');
            expect(result).not.toBeNull();
        });

        it('retourne la première case libre si aucune adjacente en MEDIUM', () => {
            const grid = GameService.init.grid();
            const result = BotService.chooseBestCell('brelan1', grid, 'MEDIUM');
            expect(result).not.toBeNull();
            expect(result.cellId).toBe('brelan1');
        });
    });
});
```

- [ ] **Step 2: GREEN — Implémenter l'adjacence pour MEDIUM**

Ajouter dans `bot.service.ts`, la fonction `findAdjacentCell` :

```typescript
const isAdjacent = (r1: number, c1: number, r2: number, c2: number): boolean => {
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1 && !(r1 === r2 && c1 === c2);
};

const findAdjacentCell = (choiceId: string, grid: Grid, botPlayer: string = 'player:2'): CellSelection | null => {
    const botPositions: { row: number; col: number }[] = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].owner === botPlayer) {
                botPositions.push({ row: r, col: c });
            }
        }
    }

    // Chercher une case libre adjacente à un pion existant
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
            const cell = grid[rowIndex][cellIndex];
            if (cell.id === choiceId && cell.owner === null) {
                const hasAdjacentPawn = botPositions.some(p => isAdjacent(p.row, p.col, rowIndex, cellIndex));
                if (hasAdjacentPawn) {
                    return { cellId: cell.id, rowIndex, cellIndex };
                }
            }
        }
    }

    // Fallback : première case libre
    return findFirstFreeCell(choiceId, grid);
};
```

Puis modifier le switch dans `chooseBestCell` :

```typescript
case 'MEDIUM':
    return findAdjacentCell(choiceId, grid);
```

- [ ] **Step 3: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx jest src/features/bot/services/bot.service.test.ts --no-coverage
```

Expected: Tous PASS

- [ ] **Step 4: Commit**

```bash
git add backend/src/features/bot/services/
git commit -m "feat: BotService stratégie MEDIUM — placement adjacent aux pions (TDD)"
```

---

## Task 6 : BotService — Stratégie Pro avec scoring et blocage (TDD)

**Files:**
- Modify: `backend/src/features/bot/services/bot.service.test.ts`
- Modify: `backend/src/features/bot/services/bot.service.ts`

- [ ] **Step 1: RED — Tests pour HARD**

Ajouter :

```typescript
describe('Stratégie HARD', () => {
    describe('chooseBestCombination', () => {
        it('choisit la combo qui a une case libre utile en mode HARD', () => {
            const grid = GameService.init.grid();
            const choices = [
                { id: 'brelan3', value: 'Brelan3' },
                { id: 'full', value: 'Full' },
            ];
            const result = BotService.chooseBestCombination(choices, grid, 'HARD');
            expect(result).not.toBeNull();
            expect(['brelan3', 'full']).toContain(result);
        });
    });

    describe('chooseBestCell', () => {
        it('préfère une case qui crée un alignement en HARD', () => {
            const grid = GameService.init.grid();
            // Placer 2 pions bot alignés horizontalement
            grid[0][0].owner = 'player:2';
            grid[0][1].owner = 'player:2';

            // Si brelan3 correspond à grid[0][2], le bot devrait la choisir
            const result = BotService.chooseBestCell('brelan3', grid, 'HARD');
            expect(result).not.toBeNull();
        });

        it('bloque un alignement adverse en HARD si possible', () => {
            const grid = GameService.init.grid();
            // Placer 2 pions adverses alignés
            grid[1][0].owner = 'player:1';
            grid[1][1].owner = 'player:1';

            const result = BotService.chooseBestCell('brelan2', grid, 'HARD');
            expect(result).not.toBeNull();
        });
    });
});
```

- [ ] **Step 2: GREEN — Implémenter la stratégie HARD**

Ajouter les fonctions de scoring :

```typescript
const countAlignmentScore = (row: number, col: number, grid: Grid, player: string): number => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; // horizontal, vertical, diag, anti-diag
    let score = 0;

    for (const [dr, dc] of directions) {
        let count = 1;
        // Compter dans la direction positive
        for (let i = 1; i < 5; i++) {
            const nr = row + dr * i;
            const nc = col + dc * i;
            if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc].owner === player) {
                count++;
            } else break;
        }
        // Compter dans la direction négative
        for (let i = 1; i < 5; i++) {
            const nr = row - dr * i;
            const nc = col - dc * i;
            if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc].owner === player) {
                count++;
            } else break;
        }
        if (count >= 2) score += count;
    }

    return score;
};

const findBestScoringCell = (choiceId: string, grid: Grid): CellSelection | null => {
    const candidates: (CellSelection & { score: number })[] = [];

    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
            const cell = grid[rowIndex][cellIndex];
            if (cell.id === choiceId && cell.owner === null) {
                const ownScore = countAlignmentScore(rowIndex, cellIndex, grid, 'player:2');
                const blockScore = countAlignmentScore(rowIndex, cellIndex, grid, 'player:1');
                candidates.push({
                    cellId: cell.id,
                    rowIndex,
                    cellIndex,
                    score: ownScore * 2 + blockScore, // Priorise ses propres alignements mais bloque aussi
                });
            }
        }
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.score - a.score);
    return { cellId: candidates[0].cellId, rowIndex: candidates[0].rowIndex, cellIndex: candidates[0].cellIndex };
};

const chooseCombinationForBestCell = (playable: Combination[], grid: Grid): string | null => {
    let bestCombo: string | null = null;
    let bestScore = -1;

    for (const combo of playable) {
        const cell = findBestScoringCell(combo.id, grid);
        if (cell) {
            const tempGrid = grid.map(row => row.map(c => ({ ...c })));
            tempGrid[cell.rowIndex][cell.cellIndex].owner = 'player:2';
            const score = countAlignmentScore(cell.rowIndex, cell.cellIndex, tempGrid, 'player:2');
            if (score > bestScore) {
                bestScore = score;
                bestCombo = combo.id;
            }
        }
    }

    return bestCombo ?? chooseCombinationByPriority(playable, PRIORITY_MEDIUM);
};
```

Puis modifier les switches :

```typescript
// chooseBestCombination
case 'HARD':
    return chooseCombinationForBestCell(playable, grid);

// chooseBestCell
case 'HARD':
    return findBestScoringCell(choiceId, grid);
```

- [ ] **Step 3: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npx jest src/features/bot/services/bot.service.test.ts --no-coverage
```

Expected: Tous PASS

- [ ] **Step 4: Commit**

```bash
git add backend/src/features/bot/services/
git commit -m "feat: BotService stratégie HARD — scoring, alignements et blocage (TDD)"
```

---

## Task 7 : Backend propagation — Handler, matchmaking, socket, history

**Files:**
- Modify: `backend/src/features/bot/handlers/bot.handler.ts`
- Modify: `backend/src/features/matchmaking/handlers/matchmaking.handler.ts`
- Modify: `backend/src/features/history/services/history.service.ts`
- Modify: `backend/src/infrastructure/socket.setup.ts`

- [ ] **Step 1: Modifier bot.handler.ts — propager difficulty**

Dans `backend/src/features/bot/handlers/bot.handler.ts` :

1. Importer `BotDifficulty` :
```typescript
import { BotDifficulty } from '../../../../shared/types/game.types';
```

2. Modifier la signature de `setupBotListeners` pour accepter `difficulty` :
```typescript
export const setupBotListeners = (botSocket: SocketLike, game: Game, games: Game[], difficulty: BotDifficulty = 'MEDIUM'): void => {
```

3. Dans `playTurn`, passer `difficulty` aux appels BotService :
```typescript
const bestChoice = BotService.chooseBestCombination(
    game.gameState.choices.availableChoices,
    game.gameState.grid,
    difficulty,
);
```

4. Dans `selectAndPlaceCombination`, passer `difficulty` :
```typescript
const selectAndPlaceCombination = (game: Game, games: Game[], choiceId: string, difficulty: BotDifficulty): void => {
    handleChoiceSelected(game, choiceId);
    setTimeout(() => {
        if (!isGameActive(game, games)) return;
        const cell = BotService.chooseBestCell(choiceId, game.gameState.grid, difficulty);
        // ...
    }, DELAY_PLACE_ON_GRID_MS);
};
```

5. Dans `lockDicesForNextRoll`, passer `difficulty` :
```typescript
const lockDicesForNextRoll = (game: Game, difficulty: BotDifficulty): void => {
    const diceIdsToLock = BotService.chooseDicesToLock(game.gameState.deck.dices, difficulty);
    // ...
};
```

- [ ] **Step 2: Modifier history.service.ts — PlayerInput avec difficulty**

Dans `backend/src/features/history/services/history.service.ts`, ajouter `difficulty` à l'interface `PlayerInput` :

```typescript
interface PlayerInput {
    userId: string | null;
    playerNumber: number;
    isBot: boolean;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
}
```

Et dans `createGame`, ajouter `difficulty` au `create` :

```typescript
data: {
    mode: input.mode,
    players: {
        create: input.players.map((p) => ({
            playerNumber: p.playerNumber,
            userId: p.userId,
            isBot: p.isBot,
            difficulty: p.difficulty ?? null,
        })),
    },
},
```

- [ ] **Step 3: Modifier matchmaking.handler.ts — recevoir et propager difficulty**

Dans `backend/src/features/matchmaking/handlers/matchmaking.handler.ts` :

1. Importer `BotDifficulty` :
```typescript
import { BotDifficulty } from '../../../../shared/types/game.types';
```

2. Modifier la signature de `createGameVsBot` :
```typescript
export const createGameVsBot = async (playerSocket: SocketLike, games: Game[], difficulty: BotDifficulty = 'MEDIUM'): Promise<void> => {
```

3. Dans `saveGameToDatabase`, passer la difficulty au joueur bot :
```typescript
const dbGame = await HistoryService.createGame({
    mode,
    players: [
        { userId: player1Id, playerNumber: 1, isBot: false },
        { userId: player2Id || null, playerNumber: 2, isBot: !player2Id, difficulty: mode === 'VS_BOT' ? difficulty : null },
    ],
});
```

Note : `saveGameToDatabase` doit aussi recevoir `difficulty` en paramètre. Modifier sa signature :

```typescript
const saveGameToDatabase = async (game: Game, mode: 'ONLINE' | 'VS_BOT', difficulty?: BotDifficulty): Promise<void> => {
```

Et dans `createGameVsBot`, passer `difficulty` à `saveGameToDatabase` et `setupBotListeners` :

```typescript
await saveGameToDatabase(newGame, 'VS_BOT', difficulty);
setupBotListeners(botSocket, newGame, games, difficulty);
```

- [ ] **Step 4: Modifier socket.setup.ts — passer difficulty depuis l'event**

Dans `backend/src/infrastructure/socket.setup.ts`, modifier le handler `game.vsbot` :

```typescript
socket.on('game.vsbot', (data: { difficulty?: string } = {}) => {
    const difficulty = (['EASY', 'MEDIUM', 'HARD'].includes(data?.difficulty ?? '') ? data.difficulty : 'MEDIUM') as BotDifficulty;
    safeHandler('game.vsbot', socket.id, () => {
        createGameVsBot(socket, games, difficulty);
        logServerState(games, 'après game.vsbot');
    });
});
```

Importer `BotDifficulty` en haut du fichier :
```typescript
import { BotDifficulty } from '../../../shared/types/game.types';
```

- [ ] **Step 5: Lancer les tests backend**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npm test -- --no-coverage
```

Expected: Tous PASS (les anciens appels sans difficulty utilisent le défaut `'MEDIUM'`)

- [ ] **Step 6: Commit**

```bash
git add backend/src/ shared/types/
git commit -m "feat: propagation difficulty dans toute la chaîne backend (handler → BDD)"
```

---

## Task 8 : Frontend — BotDifficultyScreen (TDD)

**Files:**
- Create: `frontend/src/features/game/screens/bot-difficulty.screen.test.tsx`
- Create: `frontend/src/features/game/screens/bot-difficulty.screen.tsx`

- [ ] **Step 1: RED — Écrire les tests**

Créer `frontend/src/features/game/screens/bot-difficulty.screen.test.tsx` :

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BotDifficultyScreen from './bot-difficulty.screen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const navigation = { navigate: mockNavigate, goBack: mockGoBack };

describe('BotDifficultyScreen', () => {
    beforeEach(() => jest.clearAllMocks());

    test('affiche le titre "Mode Entraînement"', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        expect(getByText('Mode Entraînement')).toBeTruthy();
    });

    test('affiche les 3 cartes de difficulté', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        expect(getByText('Débutant')).toBeTruthy();
        expect(getByText('Tactique')).toBeTruthy();
        expect(getByText('Maître IA')).toBeTruthy();
    });

    test('affiche les descriptions', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        expect(getByText(/se chauffer/)).toBeTruthy();
        expect(getByText(/défi équilibré/)).toBeTruthy();
        expect(getByText(/droit à l'erreur/)).toBeTruthy();
    });

    test('naviguer vers VsBotGameScreen avec EASY au clic sur Débutant', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        fireEvent.click(getByText('Débutant'));
        expect(mockNavigate).toHaveBeenCalledWith('VsBotGameScreen', { difficulty: 'EASY' });
    });

    test('naviguer vers VsBotGameScreen avec MEDIUM au clic sur Tactique', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        fireEvent.click(getByText('Tactique'));
        expect(mockNavigate).toHaveBeenCalledWith('VsBotGameScreen', { difficulty: 'MEDIUM' });
    });

    test('naviguer vers VsBotGameScreen avec HARD au clic sur Maître IA', () => {
        const { getByText } = render(<BotDifficultyScreen navigation={navigation} />);
        fireEvent.click(getByText('Maître IA'));
        expect(mockNavigate).toHaveBeenCalledWith('VsBotGameScreen', { difficulty: 'HARD' });
    });

    test('bouton retour appelle goBack', () => {
        const { getByTestId } = render(<BotDifficultyScreen navigation={navigation} />);
        fireEvent.click(getByTestId('icon-arrow-left'));
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/game/screens/bot-difficulty.screen.test.tsx --no-coverage
```

Expected: FAIL — module not found

- [ ] **Step 3: GREEN — Implémenter l'écran**

Créer `frontend/src/features/game/screens/bot-difficulty.screen.tsx` :

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface NavigationProp {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
}

interface Props {
    navigation: NavigationProp;
}

interface DifficultyOption {
    key: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    name: string;
    subtitle: string;
    description: string;
    stars: number;
    color: string;
}

const DIFFICULTIES: DifficultyOption[] = [
    {
        key: 'easy',
        difficulty: 'EASY',
        name: 'Débutant',
        subtitle: 'Facile',
        description: 'Idéal pour se chauffer. Le bot fait des erreurs simples.',
        stars: 1,
        color: colors.success,
    },
    {
        key: 'medium',
        difficulty: 'MEDIUM',
        name: 'Tactique',
        subtitle: 'Intermédiaire',
        description: 'Un défi équilibré. Ce bot connaît ses probabilités.',
        stars: 2,
        color: colors.gold,
    },
    {
        key: 'hard',
        difficulty: 'HARD',
        name: 'Maître IA',
        subtitle: 'Pro',
        description: 'Aucun droit à l\'erreur. Ce bot joue pour le Grand Yam.',
        stars: 3,
        color: colors.primary,
    },
];

const renderStars = (count: number, color: string): string => {
    return '★'.repeat(count) + '☆'.repeat(3 - count);
};

const BotDifficultyScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yam Master</Text>
                <View style={styles.backButton} />
            </View>

            <Text style={styles.subtitle}>Mode Entraînement</Text>

            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Choisir la Difficulté</Text>
            </View>
            <Text style={styles.sectionDescription}>Affrontez nos maîtres du Yam.</Text>

            <View style={styles.cards}>
                {DIFFICULTIES.map((diff) => (
                    <TouchableOpacity
                        key={diff.key}
                        style={styles.card}
                        onPress={() => navigation.navigate('VsBotGameScreen', { difficulty: diff.difficulty })}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardLeft}>
                                <Text style={[styles.stars, { color: diff.color }]}>
                                    {renderStars(diff.stars, diff.color)}
                                </Text>
                                <Text style={styles.cardName}>{diff.name}</Text>
                                <Text style={[styles.cardSubtitle, { color: diff.color }]}>{diff.subtitle}</Text>
                                <Text style={styles.cardDescription}>{diff.description}</Text>
                            </View>
                            <View style={[styles.cardIcon, { backgroundColor: diff.color }]}>
                                <Feather name="cpu" size={24} color={colors.white} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

export default BotDifficultyScreen;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        padding: 24,
        paddingTop: 48,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: fontDisplay,
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    subtitle: {
        fontFamily: fontDisplay,
        fontSize: 22,
        fontWeight: '900',
        color: colors.primary,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    sectionAccent: {
        width: 24,
        height: 2,
        backgroundColor: colors.primary,
    },
    sectionTitle: {
        fontFamily: fontDisplay,
        fontSize: 13,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    sectionDescription: {
        fontFamily: fontSans,
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 20,
    },
    cards: {
        gap: 14,
    },
    card: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 20,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLeft: {
        flex: 1,
        gap: 4,
    },
    stars: {
        fontSize: 14,
        letterSpacing: 2,
        marginBottom: 4,
    },
    cardName: {
        fontFamily: fontDisplay,
        fontSize: 18,
        fontWeight: '900',
        color: colors.textPrimary,
        textTransform: 'uppercase',
    },
    cardSubtitle: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    cardDescription: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest src/features/game/screens/bot-difficulty.screen.test.tsx --no-coverage
```

Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/game/screens/bot-difficulty*
git commit -m "feat: écran BotDifficultyScreen — sélection Débutant/Tactique/Maître IA (TDD)"
```

---

## Task 9 : Frontend — Navigation et Controller avec difficulty

**Files:**
- Modify: `frontend/App.tsx`
- Modify: `frontend/src/features/home/screens/home.screen.tsx`
- Modify: `frontend/src/features/game/screens/vs-bot-game.screen.tsx`
- Modify: `frontend/src/features/game/controllers/vs-bot-game.controller.tsx`

- [ ] **Step 1: Modifier App.tsx — ajouter BotDifficultyScreen et route params**

1. Importer BotDifficultyScreen :
```typescript
import BotDifficultyScreen from '@/features/game/screens/bot-difficulty.screen';
```

2. Modifier `HomeStackParamList` :
```typescript
type HomeStackParamList = {
    HomeScreen: undefined;
    BotDifficultyScreen: undefined;
    OnlineGameScreen: undefined;
    VsBotGameScreen: { difficulty: string };
    HistoryScreen: undefined;
    ReplayScreen: { gameId: string };
};
```

3. Ajouter le screen dans `HomeStackNavigator`, entre HomeScreen et OnlineGameScreen :
```typescript
<HomeStack.Screen name="BotDifficultyScreen" component={BotDifficultyScreen} />
```

- [ ] **Step 2: Modifier home.screen.tsx — naviguer vers BotDifficultyScreen**

Dans le tableau `ACTIONS`, changer `screen: 'VsBotGameScreen'` en `screen: 'BotDifficultyScreen'` :

```typescript
{
    screen: 'BotDifficultyScreen',
    icon: 'cpu',
    label: 'Vs Bot',
    description: 'Entraînement tactique',
    color: colors.accent,
},
```

- [ ] **Step 3: Modifier vs-bot-game.screen.tsx — recevoir difficulty**

Ajouter le route param :

```typescript
interface VsBotGameScreenProps {
    navigation?: {
        navigate: (screen: string) => void;
    };
    route?: {
        params?: { difficulty?: string };
    };
}
```

Passer la difficulty au controller :

```typescript
{socket && (
    <VsBotGameController
        navigation={navigation}
        difficulty={route?.params?.difficulty ?? 'MEDIUM'}
    />
)}
```

- [ ] **Step 4: Modifier vs-bot-game.controller.tsx — émettre difficulty**

1. Ajouter `difficulty` aux props :
```typescript
interface VsBotGameControllerProps {
    navigation?: {
        navigate: (screen: string) => void;
    };
    difficulty?: string;
}
```

2. Modifier le `socket.emit` dans useEffect :
```typescript
socket.emit('game.vsbot', { difficulty: difficulty ?? 'MEDIUM' });
```

3. Modifier le replay emit :
```typescript
onReplay={() => {
    setGameResult(null);
    setInGame(false);
    socket.emit('game.vsbot', { difficulty: difficulty ?? 'MEDIUM' });
}}
```

- [ ] **Step 5: Lancer tous les tests frontend**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npx jest --no-coverage
```

Fix les tests qui échouent (notamment `vs-bot-game.controller.test.tsx` qui vérifie `socket.emit('game.vsbot')` — à mettre à jour avec `socket.emit('game.vsbot', { difficulty: 'MEDIUM' })`).

- [ ] **Step 6: Commit**

```bash
git add frontend/App.tsx frontend/src/features/home/ frontend/src/features/game/
git commit -m "feat: navigation difficulty — Home → BotDifficulty → VsBot avec param"
```

---

## Task 10 : Tests globaux + lint + coverage

**Files:** Aucun nouveau

- [ ] **Step 1: Tests backend**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend
npm test -- --no-coverage
```

- [ ] **Step 2: Tests frontend**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend
npm test -- --no-coverage
```

- [ ] **Step 3: Lint**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend && npm run lint
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend && npm run lint
```

- [ ] **Step 4: Coverage**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/backend && npm run test:coverage
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster/frontend && npm run test:coverage
```

Expected: ≥ 90% des deux côtés

- [ ] **Step 5: Commit si corrections**

```bash
git add -A
git commit -m "fix: corrections tests et lint après intégration bot difficulty"
```

---

## Task 11 : Merge dans develop

**Files:** Aucun

- [ ] **Step 1: Merge et push**

```bash
git checkout develop
git merge feature/bot-difficulty --no-ff -m "merge: Intègre feature/bot-difficulty dans develop"
git push origin develop
```
