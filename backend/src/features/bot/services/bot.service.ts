// backend/src/features/bot/services/bot.service.ts

import { Dice, Combination, Grid, PlayerKey } from '../../../shared/types';

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

const BOT_PLAYER: PlayerKey = 'player:2';
const OPPONENT_PLAYER: PlayerKey = 'player:1';

const MEDIUM_PRIORITY = ['yam', 'carre', 'full', 'suite', 'sec', 'defi', 'moinshuit'];
const EASY_PRIORITY = ['brelan1', 'brelan2', 'brelan3', 'brelan4', 'brelan5', 'brelan6', 'moinshuit', 'suite', 'full', 'carre', 'yam'];

interface CellSelection {
    cellId: string;
    rowIndex: number;
    cellIndex: number;
}

// -----------------------------------------------------------------------
// Helpers communs
// -----------------------------------------------------------------------

function getPlayableCombinations(choices: Combination[], grid: Grid): Combination[] {
    return choices.filter(choice =>
        grid.some(row => row.some(cell => cell.id === choice.id && cell.owner === null))
    );
}

function chooseCombinationByPriority(playable: Combination[], priority: string[]): string | null {
    for (const prio of priority) {
        const match = playable.find(c => c.id === prio);
        if (match) return match.id;
    }
    return playable[0]?.id ?? null;
}

function findFirstFreeCell(choiceId: string, grid: Grid): CellSelection | null {
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
            const cell = grid[rowIndex][cellIndex];
            if (cell.id === choiceId && cell.owner === null) {
                return { cellId: cell.id, rowIndex, cellIndex };
            }
        }
    }
    return null;
}

function lockByFrequency(dices: Dice[]): number[] {
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
}

// -----------------------------------------------------------------------
// Helpers MEDIUM — placement adjacent
// -----------------------------------------------------------------------

function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1 && !(r1 === r2 && c1 === c2);
}

function collectBotCells(grid: Grid): { row: number; col: number }[] {
    const botCells: { row: number; col: number }[] = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].owner === BOT_PLAYER) {
                botCells.push({ row: r, col: c });
            }
        }
    }
    return botCells;
}

function findFreeCellAdjacentToBotCells(
    choiceId: string,
    grid: Grid,
    botCells: { row: number; col: number }[]
): CellSelection | null {
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
            const cell = grid[rowIndex][cellIndex];
            if (cell.id !== choiceId || cell.owner !== null) continue;
            const adjacentToBot = botCells.some(b => isAdjacent(b.row, b.col, rowIndex, cellIndex));
            if (adjacentToBot) return { cellId: cell.id, rowIndex, cellIndex };
        }
    }
    return null;
}

function findAdjacentCell(choiceId: string, grid: Grid): CellSelection | null {
    const botCells = collectBotCells(grid);
    if (botCells.length === 0) return findFirstFreeCell(choiceId, grid);
    return findFreeCellAdjacentToBotCells(choiceId, grid, botCells) ?? findFirstFreeCell(choiceId, grid);
}

// -----------------------------------------------------------------------
// Helpers HARD — scoring par alignement
// -----------------------------------------------------------------------

const DIRECTIONS = [
    { dr: 0, dc: 1 },   // horizontal
    { dr: 1, dc: 0 },   // vertical
    { dr: 1, dc: 1 },   // diagonal
    { dr: 1, dc: -1 },  // anti-diagonal
];

function countConsecutiveInDirection(
    row: number, col: number, dr: number, dc: number, grid: Grid, player: PlayerKey
): number {
    const size = grid.length;
    let count = 0;
    for (let step = 1; step < size; step++) {
        const r = row + dr * step;
        const c = col + dc * step;
        if (r < 0 || r >= size || c < 0 || c >= grid[r].length) break;
        if (grid[r][c].owner !== player) break;
        count++;
    }
    return count;
}

function countDirectionScore(
    row: number, col: number, dr: number, dc: number, grid: Grid, player: PlayerKey
): number {
    const forward = countConsecutiveInDirection(row, col, dr, dc, grid, player);
    const backward = countConsecutiveInDirection(row, col, -dr, -dc, grid, player);
    const total = 1 + forward + backward;
    return total >= 2 ? total : 0;
}

function countAlignmentScore(row: number, col: number, grid: Grid, player: PlayerKey): number {
    return DIRECTIONS.reduce((sum, { dr, dc }) => sum + countDirectionScore(row, col, dr, dc, grid, player), 0);
}

function findBestScoringCell(choiceId: string, grid: Grid): CellSelection | null {
    let bestCell: CellSelection | null = null;
    let bestScore = -1;

    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
            const cell = grid[rowIndex][cellIndex];
            if (cell.id !== choiceId || cell.owner !== null) continue;

            const score = scoreCellForHard(rowIndex, cellIndex, grid);
            if (score > bestScore) {
                bestScore = score;
                bestCell = { cellId: cell.id, rowIndex, cellIndex };
            }
        }
    }

    return bestCell ?? findFirstFreeCell(choiceId, grid);
}

function scoreCellForHard(rowIndex: number, cellIndex: number, grid: Grid): number {
    const ownScore = countAlignmentScore(rowIndex, cellIndex, grid, BOT_PLAYER) * 2;
    const blockScore = countAlignmentScore(rowIndex, cellIndex, grid, OPPONENT_PLAYER);
    return ownScore + blockScore;
}

function bestScoreForCombo(comboId: string, grid: Grid): number {
    let best = -1;
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
            const cell = grid[rowIndex][cellIndex];
            if (cell.id !== comboId || cell.owner !== null) continue;
            const score = scoreCellForHard(rowIndex, cellIndex, grid);
            if (score > best) best = score;
        }
    }
    return best;
}

function chooseCombinationForBestCell(playable: Combination[], grid: Grid): string | null {
    let bestCombo: string | null = null;
    let bestScore = -1;

    for (const combo of playable) {
        const comboScore = bestScoreForCombo(combo.id, grid);
        if (comboScore > bestScore) {
            bestScore = comboScore;
            bestCombo = combo.id;
        }
    }

    return bestCombo;
}

// -----------------------------------------------------------------------
// BotService public API
// -----------------------------------------------------------------------

const BotService = {

    chooseBestCombination: (
        availableChoices: Combination[],
        grid: Grid,
        difficulty: BotDifficulty = 'MEDIUM'
    ): string | null => {
        if (!availableChoices || availableChoices.length === 0) return null;

        const playable = getPlayableCombinations(availableChoices, grid);
        if (playable.length === 0) return null;

        switch (difficulty) {
            case 'EASY':
                return chooseCombinationByPriority(playable, EASY_PRIORITY);
            case 'HARD':
                return chooseCombinationForBestCell(playable, grid);
            case 'MEDIUM':
            default:
                return chooseCombinationByPriority(playable, MEDIUM_PRIORITY);
        }
    },

    chooseBestCell: (
        choiceId: string,
        grid: Grid,
        difficulty: BotDifficulty = 'MEDIUM'
    ): CellSelection | null => {
        switch (difficulty) {
            case 'EASY':
                return findFirstFreeCell(choiceId, grid);
            case 'HARD':
                return findBestScoringCell(choiceId, grid);
            case 'MEDIUM':
            default:
                return findAdjacentCell(choiceId, grid);
        }
    },

    chooseDicesToLock: (dices: Dice[], _difficulty: BotDifficulty = 'MEDIUM'): number[] => {
        return lockByFrequency(dices);
    },
};

export default BotService;
