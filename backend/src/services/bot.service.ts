// backend/src/services/bot.service.ts

import { Dice, Combination, Grid } from '../types';

interface CellSelection {
    cellId: string;
    rowIndex: number;
    cellIndex: number;
}

const BotService = {

    chooseBestCombination: (availableChoices: Combination[], grid: Grid): string | null => {
        if (!availableChoices || availableChoices.length === 0) return null;

        const priority = ['yam', 'carre', 'full', 'suite', 'sec', 'defi', 'moinshuit'];

        const playable = availableChoices.filter(choice =>
            grid.some(row => row.some(cell => cell.id === choice.id && cell.owner === null))
        );

        if (playable.length === 0) return null;

        for (const prio of priority) {
            const match = playable.find(c => c.id === prio);
            if (match) return match.id;
        }

        return playable[0].id;
    },

    chooseBestCell: (choiceId: string, grid: Grid): CellSelection | null => {
        for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
            for (let cellIndex = 0; cellIndex < grid[rowIndex].length; cellIndex++) {
                const cell = grid[rowIndex][cellIndex];
                if (cell.id === choiceId && cell.owner === null) {
                    return { cellId: cell.id, rowIndex, cellIndex };
                }
            }
        }
        return null;
    },

    chooseDicesToLock: (dices: Dice[]): number[] => {
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
    },
};

export default BotService;
