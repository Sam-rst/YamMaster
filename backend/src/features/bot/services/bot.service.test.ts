import BotService from './bot.service';
import GameService from '../../game/services/game.service';

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

    // =========================================================
    // Task 4: Stratégie EASY
    // =========================================================
    describe('Stratégie EASY', () => {
        describe('chooseBestCombination', () => {
            it('priorise brelan avant yam en mode EASY', () => {
                const grid = GameService.init.grid();
                const availableChoices = [
                    { id: 'yam', value: 'Yam' },
                    { id: 'brelan3', value: 'Brelan3' },
                ];
                const result = BotService.chooseBestCombination(availableChoices, grid, 'EASY');
                expect(result).toBe('brelan3');
            });

            it('priorise moinshuit avant full en mode EASY', () => {
                const grid = GameService.init.grid();
                const availableChoices = [
                    { id: 'full', value: 'Full' },
                    { id: 'moinshuit', value: '≤8' },
                ];
                const result = BotService.chooseBestCombination(availableChoices, grid, 'EASY');
                expect(result).toBe('moinshuit');
            });
        });

        describe('chooseBestCell', () => {
            it('choisit la première case libre en mode EASY', () => {
                const grid = GameService.init.grid();
                const result = BotService.chooseBestCell('brelan1', grid, 'EASY');
                expect(result).not.toBeNull();
                expect(result.cellId).toBe('brelan1');
                // La première case brelan1 dans la grille est à [0][0]
                expect(result.rowIndex).toBe(0);
                expect(result.cellIndex).toBe(0);
            });
        });

        describe('chooseDicesToLock', () => {
            it('verrouille correctement les paires en mode EASY', () => {
                const dices = [
                    { id: 1, value: '3', locked: false },
                    { id: 2, value: '3', locked: false },
                    { id: 3, value: '5', locked: false },
                    { id: 4, value: '1', locked: false },
                    { id: 5, value: '2', locked: false },
                ];
                const result = BotService.chooseDicesToLock(dices, 'EASY');
                expect(result).toContain(1);
                expect(result).toContain(2);
            });
        });
    });

    // =========================================================
    // Task 5: Stratégie MEDIUM
    // =========================================================
    describe('Stratégie MEDIUM', () => {
        describe('chooseBestCell', () => {
            it('préfère une case adjacente à un pion existant en mode MEDIUM', () => {
                const grid = GameService.init.grid();
                // Placer un pion bot (player:2) en [0][0] (brelan1)
                grid[0][0].owner = 'player:2';
                // La grille a 'brelan1' en [0][0] et [3][4]
                // Avec un pion en [0][0], une case adjacente serait [0][1], [1][0], [1][1]
                // La case 'full' est en [1][3] et [2][1] — pas adjacente
                // Cherchons une combo dont une case est adjacente
                // 'brelan3' est en [0][1] (adjacent à [0][0])
                const result = BotService.chooseBestCell('brelan3', grid, 'MEDIUM');
                expect(result).not.toBeNull();
                // [0][1] est adjacent à [0][0] où il y a un pion bot
                expect(result.rowIndex).toBe(0);
                expect(result.cellIndex).toBe(1);
            });

            it('retourne la première case libre si aucune adjacente en MEDIUM', () => {
                const grid = GameService.init.grid();
                // Pas de pion bot sur la grille
                const result = BotService.chooseBestCell('full', grid, 'MEDIUM');
                expect(result).not.toBeNull();
                // Première case 'full' est en [1][3]
                expect(result.rowIndex).toBe(1);
                expect(result.cellIndex).toBe(3);
            });
        });
    });

    // =========================================================
    // Task 6: Stratégie HARD
    // =========================================================
    describe('Stratégie HARD', () => {
        describe('chooseBestCombination', () => {
            it('choisit la combo qui a une case libre utile en mode HARD', () => {
                const grid = GameService.init.grid();
                // Placer des pions bot pour créer une opportunité d'alignement
                // Ligne 0: [0][0]=bot, [0][1]=bot → [0][2] serait aligné
                grid[0][0].owner = 'player:2'; // brelan1
                grid[0][1].owner = 'player:2'; // brelan3
                // Avec 'defi' en [0][2], ça forme un alignement de 3
                const availableChoices = [
                    { id: 'defi', value: 'Défi' },
                    { id: 'moinshuit', value: '≤8' },
                ];
                const result = BotService.chooseBestCombination(availableChoices, grid, 'HARD');
                expect(result).not.toBeNull();
                // defi a une case en [0][2] qui est adjacente aux pions bot → meilleur score
                expect(result).toBe('defi');
            });
        });

        describe('chooseBestCell', () => {
            it('préfère une case qui crée un alignement en HARD', () => {
                const grid = GameService.init.grid();
                // Placer pions bot en ligne
                grid[0][0].owner = 'player:2'; // brelan1
                grid[0][1].owner = 'player:2'; // brelan3
                // La case 'defi' est en [0][2] et [3][2] — [0][2] prolonge l'alignement
                const result = BotService.chooseBestCell('defi', grid, 'HARD');
                expect(result).not.toBeNull();
                // [0][2] est dans le prolongement de [0][0] et [0][1]
                expect(result.rowIndex).toBe(0);
                expect(result.cellIndex).toBe(2);
            });

            it('bloque un alignement adverse en HARD si possible', () => {
                const grid = GameService.init.grid();
                // Placer pions adversaire en ligne
                grid[0][0].owner = 'player:1'; // brelan1
                grid[0][1].owner = 'player:1'; // brelan3
                // La case 'defi' est en [0][2] et [3][2]
                // [0][2] bloque l'alignement adverse
                const result = BotService.chooseBestCell('defi', grid, 'HARD');
                expect(result).not.toBeNull();
                expect(result.rowIndex).toBe(0);
                expect(result.cellIndex).toBe(2);
            });
        });
    });
});
