# Replay Visuel — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer le replay post-partie en spectateur visuel avec plateau de jeu, dés, scores et jetons à chaque step.

**Architecture:** Backend enrichit le turn-recorder avec un snapshot GameState après chaque action. Frontend crée des composants read-only isolés (replay-board) alimentés par ces snapshots. Les styles visuels sont centralisés dans shared/theme/ pour être partagés entre game board et replay.

**Tech Stack:** TypeScript, React Native/Expo, Node.js/Express, Jest

---

## File Map

### Backend — Fichiers modifiés
- `backend/src/features/game/handlers/game.handler.ts` — Ajouter `recordGameSnapshot()` après chaque `recordTurn()`
- `backend/src/features/game/services/turn-recorder.service.test.ts` — Nouveau test pour alternance action/snapshot

### Frontend — Fichiers créés (thème)
- `frontend/src/shared/theme/fonts.ts` — Centralise fontDisplay et fontSans
- `frontend/src/shared/theme/game-styles.ts` — Styles partagés dés, grille, scores
- `frontend/src/shared/theme/index.ts` — Barrel export

### Frontend — Fichiers modifiés (thème)
- `frontend/src/shared/theme/colors.ts` — Ajouter couleurs game-specific

### Frontend — Fichiers créés (replay-board)
- `frontend/src/features/replay/components/replay-board/replay-board.component.tsx`
- `frontend/src/features/replay/components/replay-board/replay-board.component.test.tsx`
- `frontend/src/features/replay/components/replay-board/replay-grid/replay-grid.component.tsx`
- `frontend/src/features/replay/components/replay-board/replay-grid/replay-grid.component.test.tsx`
- `frontend/src/features/replay/components/replay-board/replay-dice/replay-dice.component.tsx`
- `frontend/src/features/replay/components/replay-board/replay-dice/replay-dice.component.test.tsx`
- `frontend/src/features/replay/components/replay-board/replay-scores/replay-scores.component.tsx`
- `frontend/src/features/replay/components/replay-board/replay-scores/replay-scores.component.test.tsx`
- `frontend/src/features/replay/components/replay-board/replay-action-info/replay-action-info.component.tsx`
- `frontend/src/features/replay/components/replay-board/replay-action-info/replay-action-info.component.test.tsx`

### Frontend — Fichiers modifiés
- `frontend/src/features/replay/controllers/replay.controller.tsx` — Parser paires action/snapshot, utiliser ReplayBoard
- `frontend/src/features/replay/controllers/replay.controller.test.tsx` — Mettre à jour pour le board visuel

### Frontend — Fichiers supprimés
- `frontend/src/features/replay/components/replay-action/` — Tout le dossier (7 composants + 7 tests remplacés par replay-board)

---

## Task 1 : Gitflow — Créer la branche feature

**Files:** Aucun

- [ ] **Step 1: Créer la branche depuis develop**

```bash
cd c:/Users/samue/Desktop/Ecoles/EPSI/M1/Cours/ArchitectureApplicative/YamMaster
git checkout develop
git pull origin develop
git checkout -b feature/replay-visual-board
```

---

## Task 2 : Backend — Snapshot après chaque action (TDD)

**Files:**
- Modify: `backend/src/features/game/services/turn-recorder.service.test.ts`
- Modify: `backend/src/features/game/handlers/game.handler.ts`

- [ ] **Step 1: RED — Écrire le test d'alternance action/snapshot**

Ajouter ce test dans `turn-recorder.service.test.ts` :

```typescript
test('enregistre un snapshot après une action (alternance action/snapshot)', () => {
    const recorder = TurnRecorderService.createRecorder();

    recorder.recordAction({ type: 'roll', playerNumber: 1, data: { dices: [], rollNumber: 1 } });
    recorder.recordGameState({ currentTurn: 'player:1', grid: [], player1Score: 0, player2Score: 0, player1Tokens: 12, player2Tokens: 12 });

    recorder.recordAction({ type: 'lock', playerNumber: 1, data: { diceId: 1, locked: true } });
    recorder.recordGameState({ currentTurn: 'player:1', grid: [], player1Score: 0, player2Score: 0, player1Tokens: 12, player2Tokens: 12 });

    const turns = recorder.getTurns();
    expect(turns).toHaveLength(4);
    expect(turns[0].type).toBe('roll');
    expect(turns[1].type).toBe('snapshot');
    expect(turns[2].type).toBe('lock');
    expect(turns[3].type).toBe('snapshot');
});
```

- [ ] **Step 2: Vérifier que le test passe (le recorder supporte déjà ce pattern)**

```bash
cd backend && npx jest --testPathPatterns="turn-recorder" --verbose
```

Expected: PASS — `recordGameState` existe déjà et produit des entries de type `snapshot`.

- [ ] **Step 3: Ajouter `recordGameSnapshot` dans game.handler.ts**

Ajouter la fonction après la ligne 17 (après `recordTurn`) :

```typescript
const recordGameSnapshot = (game: Game): void => {
    if (!game.turnRecorder) return;
    game.turnRecorder.recordGameState(
        JSON.parse(JSON.stringify(game.gameState))
    );
};
```

Puis ajouter `recordGameSnapshot(game);` après chaque appel `recordTurn()` dans le fichier :
- Après ligne ~138 (roll)
- Après ligne ~168 (lock)
- Après ligne ~180 (choice)
- Après ligne ~207 (grid)

- [ ] **Step 4: Lancer les tests backend**

```bash
cd backend && npm test
```

Expected: Tous les tests passent.

- [ ] **Step 5: Commit**

```bash
git add backend/src/features/game/handlers/game.handler.ts backend/src/features/game/services/turn-recorder.service.test.ts
git commit -m "feat(backend): Snapshot GameState après chaque action pour le replay visuel"
```

---

## Task 3 : Frontend — Centraliser les fonts

**Files:**
- Create: `frontend/src/shared/theme/fonts.ts`

- [ ] **Step 1: Créer fonts.ts**

```typescript
// frontend/src/shared/theme/fonts.ts
import { Platform } from 'react-native';

export const fontDisplay = Platform.select({
    web: '"Outfit", sans-serif',
    default: 'Outfit',
});

export const fontSans = Platform.select({
    web: '"Inter", sans-serif',
    default: 'Inter',
});
```

- [ ] **Step 2: Lancer les tests frontend (pas de régression)**

```bash
cd frontend && npx jest --verbose 2>&1 | tail -5
```

Expected: 165 tests passent.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/theme/fonts.ts
git commit -m "refactor(frontend): Centralise fontDisplay et fontSans dans shared/theme/fonts.ts"
```

---

## Task 4 : Frontend — Enrichir colors.ts + créer game-styles.ts + barrel export

**Files:**
- Modify: `frontend/src/shared/theme/colors.ts`
- Create: `frontend/src/shared/theme/game-styles.ts`
- Create: `frontend/src/shared/theme/index.ts`

- [ ] **Step 1: Enrichir colors.ts avec couleurs game-specific**

Ajouter à la fin de l'objet `colors` :

```typescript
    // Game-specific
    playerToken: '#e94560',
    opponentToken: '#00d2ff',
    cellPlayerOwned: 'rgba(233, 69, 96, 0.05)',
    cellPlayerOwnedBorder: 'rgba(233, 69, 96, 0.3)',
    cellOpponentOwned: 'rgba(0, 210, 255, 0.05)',
    cellOpponentOwnedBorder: 'rgba(0, 210, 255, 0.3)',
    cellHighlight: 'rgba(255, 255, 255, 0.08)',
    cellHighlightBorder: 'rgba(255, 255, 255, 0.15)',
    cellPredatorTarget: 'rgba(233, 69, 96, 0.2)',
```

- [ ] **Step 2: Créer game-styles.ts**

```typescript
// frontend/src/shared/theme/game-styles.ts
import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { fontDisplay, fontSans } from './fonts';

export const DICE_SIZE_PLAYER = 52;
export const DICE_SIZE_OPPONENT = 36;
export const DICE_BORDER_RADIUS = 10;

export const diceStyles = StyleSheet.create({
    player: {
        width: DICE_SIZE_PLAYER,
        height: DICE_SIZE_PLAYER,
        backgroundColor: colors.white,
        borderRadius: DICE_BORDER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    opponent: {
        width: DICE_SIZE_OPPONENT,
        height: DICE_SIZE_OPPONENT,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    locked: {
        borderWidth: 3,
        borderColor: colors.gold,
    },
});

export const gridCellStyles = StyleSheet.create({
    base: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.glass,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    playerOwned: {
        backgroundColor: colors.cellPlayerOwned,
        borderColor: colors.cellPlayerOwnedBorder,
    },
    opponentOwned: {
        backgroundColor: colors.cellOpponentOwned,
        borderColor: colors.cellOpponentOwnedBorder,
    },
    highlight: {
        backgroundColor: colors.cellHighlight,
        borderColor: colors.cellHighlightBorder,
    },
    predatorTarget: {
        backgroundColor: colors.cellPredatorTarget,
        borderColor: colors.primary,
        borderWidth: 2,
    },
});

export const tokenStyles = StyleSheet.create({
    player: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.playerToken,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    opponent: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.opponentToken,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});

export const scoreTextStyles = StyleSheet.create({
    label: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    value: {
        fontFamily: fontDisplay,
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
    },
});
```

- [ ] **Step 3: Créer index.ts (barrel export)**

```typescript
// frontend/src/shared/theme/index.ts
export { colors } from './colors';
export { fontDisplay, fontSans } from './fonts';
export {
    DICE_SIZE_PLAYER,
    DICE_SIZE_OPPONENT,
    DICE_BORDER_RADIUS,
    diceStyles,
    gridCellStyles,
    tokenStyles,
    scoreTextStyles,
} from './game-styles';
```

- [ ] **Step 4: Lancer les tests + lint**

```bash
cd frontend && npx jest --verbose 2>&1 | tail -5 && npm run lint
```

Expected: Tous les tests passent, 0 erreur lint.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/shared/theme/
git commit -m "refactor(frontend): Centralise styles de jeu dans shared/theme/ (colors, fonts, game-styles)"
```

---

## Task 5 : Frontend — TDD replay-action-info

**Files:**
- Create: `frontend/src/features/replay/components/replay-board/replay-action-info/replay-action-info.component.test.tsx`
- Create: `frontend/src/features/replay/components/replay-board/replay-action-info/replay-action-info.component.tsx`

- [ ] **Step 1: Créer les dossiers**

```bash
mkdir -p frontend/src/features/replay/components/replay-board/replay-action-info
```

- [ ] **Step 2: RED — Écrire le test**

```typescript
// replay-action-info.component.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import ReplayActionInfo from './replay-action-info.component';

describe('ReplayActionInfo', () => {
    it('affiche le nom du joueur et le type d\'action pour un roll', () => {
        const { getByText } = render(
            <ReplayActionInfo
                action={{ type: 'roll', playerNumber: 1, timestamp: 1000, data: {} }}
                playerName="alice"
            />
        );
        expect(getByText(/alice/i)).toBeTruthy();
        expect(getByText(/lancer/i)).toBeTruthy();
    });

    it('affiche "Début de la partie" quand action est null', () => {
        const { getByText } = render(
            <ReplayActionInfo action={null} playerName="" />
        );
        expect(getByText(/début/i)).toBeTruthy();
    });
});
```

- [ ] **Step 3: Vérifier RED**

```bash
cd frontend && npx jest --testPathPatterns="replay-action-info" --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 4: GREEN — Implémenter**

```typescript
// replay-action-info.component.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import { fontDisplay, fontSans } from '@/shared/theme/fonts';

interface TurnAction {
    type: string;
    playerNumber: number;
    timestamp: number;
    data: Record<string, unknown>;
}

interface ReplayActionInfoProps {
    action: TurnAction | null;
    playerName: string;
}

const ACTION_LABELS: Record<string, string> = {
    roll: 'Lancer de dés',
    lock: 'Verrouillage dé',
    choice: 'Choix combinaison',
    grid: 'Placement pion',
    defi: 'Défi Royal',
    predator: 'Yam Predator',
};

const ACTION_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
    roll: 'rotate-cw',
    lock: 'lock',
    choice: 'check-square',
    grid: 'grid',
    defi: 'shield',
    predator: 'zap',
};

const ACTION_COLORS: Record<string, string> = {
    roll: colors.blue,
    lock: colors.gold,
    choice: colors.success,
    grid: colors.primary,
    defi: colors.gold,
    predator: colors.primary,
};

const ReplayActionInfo: React.FC<ReplayActionInfoProps> = ({ action, playerName }) => {
    if (!action) {
        return (
            <View style={styles.container}>
                <Feather name="play-circle" size={18} color={colors.textSecondary} />
                <Text style={styles.startText}>Début de la partie</Text>
            </View>
        );
    }

    const actionColor = ACTION_COLORS[action.type] || colors.textSecondary;
    const actionIcon = ACTION_ICONS[action.type] || 'info';
    const actionLabel = ACTION_LABELS[action.type] || action.type;

    return (
        <View style={styles.container}>
            <View style={[styles.iconBox, { backgroundColor: `${actionColor}15` }]}>
                <Feather name={actionIcon} size={16} color={actionColor} />
            </View>
            <View>
                <Text style={[styles.playerName, { color: actionColor }]}>{playerName}</Text>
                <Text style={styles.actionLabel}>{actionLabel}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerName: {
        fontFamily: fontDisplay,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    actionLabel: {
        fontFamily: fontSans,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    startText: {
        fontFamily: fontSans,
        fontSize: 14,
        color: colors.textSecondary,
    },
});

export default ReplayActionInfo;
```

- [ ] **Step 5: Vérifier GREEN**

```bash
cd frontend && npx jest --testPathPatterns="replay-action-info" --verbose
```

Expected: PASS — 2 tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/replay/components/replay-board/replay-action-info/
git commit -m "feat(frontend): Composant ReplayActionInfo — bandeau action du replay (TDD)"
```

---

## Task 6 : Frontend — TDD replay-grid (read-only)

**Files:**
- Create: `frontend/src/features/replay/components/replay-board/replay-grid/replay-grid.component.test.tsx`
- Create: `frontend/src/features/replay/components/replay-board/replay-grid/replay-grid.component.tsx`

- [ ] **Step 1: Créer le dossier**

```bash
mkdir -p frontend/src/features/replay/components/replay-board/replay-grid
```

- [ ] **Step 2: RED — Écrire le test**

```typescript
// replay-grid.component.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import ReplayGrid from './replay-grid.component';

describe('ReplayGrid', () => {
    const mockGrid = [
        [
            { id: '0-0', viewContent: '1', owner: 'player:1', canBeChecked: false },
            { id: '0-1', viewContent: '3', owner: null, canBeChecked: false },
        ],
        [
            { id: '1-0', viewContent: 'Carré', owner: 'player:2', canBeChecked: false },
            { id: '1-1', viewContent: 'Sec', owner: null, canBeChecked: false },
        ],
    ];

    it('affiche le contenu des cellules', () => {
        const { getByText } = render(<ReplayGrid grid={mockGrid} />);
        expect(getByText('1')).toBeTruthy();
        expect(getByText('Sec')).toBeTruthy();
    });

    it('rend le composant sans erreur', () => {
        const { container } = render(<ReplayGrid grid={mockGrid} />);
        expect(container.firstChild).toBeTruthy();
    });
});
```

- [ ] **Step 3: Vérifier RED**

```bash
cd frontend && npx jest --testPathPatterns="replay-board/replay-grid" --verbose
```

Expected: FAIL.

- [ ] **Step 4: GREEN — Implémenter**

Un composant qui affiche une grille 5x5 en lecture seule avec les styles centralisés. Cellules colorées selon `cell.owner` (coral pour player:1, cyan pour player:2). Tokens (cercles) dans les cellules owned. Aucune interactivité (pas de onPress).

```typescript
// replay-grid.component.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { fontSans } from '@/shared/theme/fonts';
import { gridCellStyles, tokenStyles } from '@/shared/theme/game-styles';

interface GridCell {
    id: string;
    viewContent: string;
    owner: string | null;
    canBeChecked: boolean;
}

interface ReplayGridProps {
    grid: GridCell[][];
}

const ReplayGrid: React.FC<ReplayGridProps> = ({ grid }) => {
    return (
        <View style={styles.gridWrapper}>
            {grid.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((cell, cellIndex) => (
                        <View
                            key={`${rowIndex}-${cellIndex}`}
                            style={[
                                gridCellStyles.base,
                                styles.cell,
                                cell.owner === 'player:1' && gridCellStyles.playerOwned,
                                cell.owner === 'player:2' && gridCellStyles.opponentOwned,
                            ]}
                        >
                            <Text style={styles.cellText}>{cell.viewContent}</Text>
                            {cell.owner === 'player:1' && <View style={tokenStyles.player} />}
                            {cell.owner === 'player:2' && <View style={tokenStyles.opponent} />}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridWrapper: {
        width: '100%',
        maxWidth: 500,
        aspectRatio: 1,
        alignSelf: 'center',
        backgroundColor: 'rgba(22, 33, 62, 0.2)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        padding: 2,
    },
    row: {
        flexDirection: 'row',
        flex: 1,
        gap: 2,
        marginBottom: 2,
    },
    cell: {
        flex: 1,
        height: '100%',
    },
    cellText: {
        fontFamily: fontSans,
        fontSize: 14,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
});

export default ReplayGrid;
```

- [ ] **Step 5: Vérifier GREEN**

```bash
cd frontend && npx jest --testPathPatterns="replay-board/replay-grid" --verbose
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/replay/components/replay-board/replay-grid/
git commit -m "feat(frontend): Composant ReplayGrid — grille read-only du replay (TDD)"
```

---

## Task 7 : Frontend — TDD replay-dice (read-only)

**Files:**
- Create: `frontend/src/features/replay/components/replay-board/replay-dice/replay-dice.component.test.tsx`
- Create: `frontend/src/features/replay/components/replay-board/replay-dice/replay-dice.component.tsx`

- [ ] **Step 1: Créer le dossier + RED**

```bash
mkdir -p frontend/src/features/replay/components/replay-board/replay-dice
```

Test :

```typescript
// replay-dice.component.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import ReplayDice from './replay-dice.component';

describe('ReplayDice', () => {
    const mockDices = [
        { id: 1, value: '3', locked: false },
        { id: 2, value: '5', locked: true },
        { id: 3, value: '1', locked: false },
        { id: 4, value: '6', locked: false },
        { id: 5, value: '2', locked: true },
    ];

    it('rend 5 dés sans erreur', () => {
        const { container } = render(<ReplayDice dices={mockDices} />);
        expect(container.firstChild).toBeTruthy();
    });

    it('affiche le compteur de lancers', () => {
        const { getByText } = render(<ReplayDice dices={mockDices} rollsCounter={2} rollsMaximum={3} />);
        expect(getByText(/2/)).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier RED**

```bash
cd frontend && npx jest --testPathPatterns="replay-board/replay-dice" --verbose
```

Expected: FAIL.

- [ ] **Step 3: GREEN — Implémenter**

Composant qui affiche les 5 dés (réutilise le composant `Dice` existant en mode read-only via `opponent={true}` ou sans onPress) + compteur de lancers.

```typescript
// replay-dice.component.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Dice from '@/features/game/components/board/dice/die.component';
import { colors } from '@/shared/theme/colors';
import { fontDisplay, fontSans } from '@/shared/theme/fonts';

interface DiceData {
    id: number;
    value: string;
    locked: boolean;
}

interface ReplayDiceProps {
    dices: DiceData[];
    rollsCounter?: number;
    rollsMaximum?: number;
}

const ReplayDice: React.FC<ReplayDiceProps> = ({ dices, rollsCounter, rollsMaximum = 3 }) => {
    return (
        <View style={styles.container}>
            <View style={styles.diceRow}>
                {dices.map((die) => (
                    <Dice key={die.id} value={die.value} locked={die.locked} />
                ))}
            </View>
            {rollsCounter !== undefined && (
                <Text style={styles.rollInfo}>Lancer {rollsCounter}/{rollsMaximum}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8,
    },
    diceRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    rollInfo: {
        fontFamily: fontSans,
        fontSize: 12,
        fontWeight: '700',
        color: colors.textSecondary,
    },
});

export default ReplayDice;
```

- [ ] **Step 4: Vérifier GREEN + commit**

```bash
cd frontend && npx jest --testPathPatterns="replay-board/replay-dice" --verbose
git add frontend/src/features/replay/components/replay-board/replay-dice/
git commit -m "feat(frontend): Composant ReplayDice — dés read-only du replay (TDD)"
```

---

## Task 8 : Frontend — TDD replay-scores

**Files:**
- Create: `frontend/src/features/replay/components/replay-board/replay-scores/replay-scores.component.test.tsx`
- Create: `frontend/src/features/replay/components/replay-board/replay-scores/replay-scores.component.tsx`

- [ ] **Step 1: Créer le dossier + RED**

```bash
mkdir -p frontend/src/features/replay/components/replay-board/replay-scores
```

Test :

```typescript
// replay-scores.component.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import ReplayScores from './replay-scores.component';

describe('ReplayScores', () => {
    it('affiche les scores des deux joueurs', () => {
        const { getByText } = render(
            <ReplayScores
                player1Score={3}
                player2Score={1}
                player1Tokens={8}
                player2Tokens={10}
                currentTurn="player:1"
            />
        );
        expect(getByText('3')).toBeTruthy();
        expect(getByText('1')).toBeTruthy();
    });

    it('affiche les jetons', () => {
        const { getByText } = render(
            <ReplayScores
                player1Score={0}
                player2Score={0}
                player1Tokens={8}
                player2Tokens={10}
                currentTurn="player:1"
            />
        );
        expect(getByText(/8/)).toBeTruthy();
        expect(getByText(/10/)).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier RED, GREEN — Implémenter**

Composant qui affiche les scores et jetons des deux joueurs côte à côte avec le joueur actif mis en surbrillance.

- [ ] **Step 3: Vérifier GREEN + commit**

```bash
cd frontend && npx jest --testPathPatterns="replay-board/replay-scores" --verbose
git add frontend/src/features/replay/components/replay-board/replay-scores/
git commit -m "feat(frontend): Composant ReplayScores — scores read-only du replay (TDD)"
```

---

## Task 9 : Frontend — TDD replay-board (orchestrateur)

**Files:**
- Create: `frontend/src/features/replay/components/replay-board/replay-board.component.test.tsx`
- Create: `frontend/src/features/replay/components/replay-board/replay-board.component.tsx`

- [ ] **Step 1: RED — Écrire le test**

```typescript
// replay-board.component.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import ReplayBoard from './replay-board.component';

const mockGameState = {
    currentTurn: 'player:1',
    timer: 25,
    player1Score: 2,
    player2Score: 1,
    player1Tokens: 10,
    player2Tokens: 11,
    grid: [[{ id: '0-0', viewContent: '1', owner: null, canBeChecked: false }]],
    choices: { isDefi: false, isSec: false, idSelectedChoice: null, availableChoices: [] },
    deck: { dices: [{ id: 1, value: '3', locked: false }], rollsCounter: 1, rollsMaximum: 3 },
};

describe('ReplayBoard', () => {
    it('rend le plateau complet sans erreur', () => {
        const { container } = render(
            <ReplayBoard
                gameState={mockGameState}
                action={{ type: 'roll', playerNumber: 1, timestamp: 1000, data: {} }}
                playerName="alice"
            />
        );
        expect(container.firstChild).toBeTruthy();
    });

    it('affiche les scores', () => {
        const { getByText } = render(
            <ReplayBoard
                gameState={mockGameState}
                action={null}
                playerName=""
            />
        );
        expect(getByText('2')).toBeTruthy();
    });
});
```

- [ ] **Step 2: Vérifier RED, GREEN — Implémenter**

Composant orchestrateur qui assemble ReplayActionInfo + ReplayScores + ReplayGrid + ReplayDice dans un layout vertical.

- [ ] **Step 3: Vérifier GREEN + commit**

```bash
cd frontend && npx jest --testPathPatterns="replay-board.component" --verbose
git add frontend/src/features/replay/components/replay-board/
git commit -m "feat(frontend): Composant ReplayBoard — orchestrateur du plateau replay (TDD)"
```

---

## Task 10 : Frontend — Mettre à jour le controller replay

**Files:**
- Modify: `frontend/src/features/replay/controllers/replay.controller.tsx`
- Modify: `frontend/src/features/replay/controllers/replay.controller.test.tsx`

- [ ] **Step 1: RED — Mettre à jour les tests du controller**

Modifier les tests pour vérifier :
- Le controller parse les turns par paires (action index pair, snapshot index impair)
- Le `ReplayBoard` s'affiche avec un gameState (vérifier qu'un score du mockGameState apparaît)
- Le step counter reflète le nombre de paires (pas le nombre total de turns)

- [ ] **Step 2: GREEN — Modifier le controller**

Changements clés :
- Remplacer l'import de `ReplayAction` par `ReplayBoard`
- Calculer `totalSteps = Math.floor(turns.length / 2)`
- À chaque step : `action = turns[currentStep * 2]`, `snapshot = turns[currentStep * 2 + 1]`
- Passer `snapshot` comme `gameState` à `ReplayBoard`
- Le step 0 affiche le premier snapshot (état initial) sans action

- [ ] **Step 3: Vérifier GREEN**

```bash
cd frontend && npx jest --testPathPatterns="replay.controller" --verbose
```

Expected: PASS.

- [ ] **Step 4: Lancer la suite complète + lint**

```bash
cd frontend && npx jest --verbose 2>&1 | tail -5 && npm run lint
```

Expected: Tous les tests passent, 0 erreur lint.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/replay/controllers/
git commit -m "feat(frontend): Controller replay utilise ReplayBoard avec parsing paires action/snapshot"
```

---

## Task 11 : Frontend — Supprimer les anciens composants replay-action

**Files:**
- Delete: `frontend/src/features/replay/components/replay-action/` (tout le dossier)

- [ ] **Step 1: Supprimer le dossier**

```bash
rm -rf frontend/src/features/replay/components/replay-action/
```

- [ ] **Step 2: Vérifier que rien n'importe les fichiers supprimés**

```bash
cd frontend && npx jest --verbose 2>&1 | tail -5
```

Expected: Tous les tests passent (le controller n'importe plus replay-action).

- [ ] **Step 3: Commit**

```bash
git add -A frontend/src/features/replay/components/replay-action/
git commit -m "refactor(frontend): Supprime anciens composants replay-action (remplacés par replay-board)"
```

---

## Task 12 : Vérification finale + merge

**Files:** Aucun

- [ ] **Step 1: Lancer tous les tests backend + frontend**

```bash
cd backend && npm test
cd frontend && npx jest --verbose 2>&1 | tail -5 && npm run lint
```

Expected: Tout vert.

- [ ] **Step 2: Merge dans develop et push**

```bash
git checkout develop
git merge feature/replay-visual-board --no-edit
git push origin develop
```
