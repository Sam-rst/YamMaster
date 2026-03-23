const BotService = require('./bot.service');
const GameService = require('./game.service');

describe('BotService', () => {

    describe('chooseBestCombination', () => {
        it('retourne null si aucune combinaison disponible', () => {
            const result = BotService.chooseBestCombination([], []);
            expect(result).toBeNull();
        });

        it('choisit la combinaison disponible sur la grille', () => {
            const grid = GameService.init.grid();
            const availableChoices = [
                { id: 'brelan3', value: 'Brelan3' },
                { id: 'full', value: 'Full' },
            ];
            const result = BotService.chooseBestCombination(availableChoices, grid);
            expect(result).not.toBeNull();
            expect(['brelan3', 'full']).toContain(result);
        });

        it('ignore les combinaisons dont toutes les cases sont prises', () => {
            const grid = GameService.init.grid();
            // Remplir toutes les cases brelan3
            grid.forEach(row => {
                row.forEach(cell => {
                    if (cell.id === 'brelan3') cell.owner = 'player:1';
                });
            });
            const availableChoices = [
                { id: 'brelan3', value: 'Brelan3' },
                { id: 'full', value: 'Full' },
            ];
            const result = BotService.chooseBestCombination(availableChoices, grid);
            expect(result).toBe('full');
        });
    });

    describe('chooseBestCell', () => {
        it('retourne une cellule libre correspondant à la combinaison', () => {
            const grid = GameService.init.grid();
            const result = BotService.chooseBestCell('brelan1', grid);
            expect(result).not.toBeNull();
            expect(result.cellId).toBe('brelan1');
        });

        it('retourne null si aucune cellule libre', () => {
            const grid = GameService.init.grid();
            grid.forEach(row => {
                row.forEach(cell => {
                    if (cell.id === 'brelan1') cell.owner = 'player:2';
                });
            });
            const result = BotService.chooseBestCell('brelan1', grid);
            expect(result).toBeNull();
        });
    });

    describe('chooseDicesToLock', () => {
        const makeDices = (values) => values.map((v, i) => ({
            id: i + 1, value: String(v), locked: false
        }));

        it('retourne les indices des dés à garder pour un brelan en cours', () => {
            // Trois 4 et deux autres → garder les trois 4
            const dices = makeDices([4, 2, 4, 4, 6]);
            const result = BotService.chooseDicesToLock(dices);
            expect(result).toBeInstanceOf(Array);
            // Doit verrouiller les dés de valeur 4 (indices 0, 2, 3)
            expect(result).toContain(1);
            expect(result).toContain(3);
            expect(result).toContain(4);
        });

        it('retourne un tableau vide si aucun pattern intéressant', () => {
            const dices = makeDices([1, 3, 2, 6, 4]);
            const result = BotService.chooseDicesToLock(dices);
            expect(result).toEqual([]);
        });
    });
});
