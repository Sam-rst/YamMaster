const GameService = require('./game.service');

// =============================================================
// INIT
// =============================================================
describe('GameService.init', () => {

    describe('gameState', () => {
        it('retourne un état de jeu avec les valeurs par défaut', () => {
            const game = GameService.init.gameState();
            expect(game.gameState).toBeDefined();
            expect(game.gameState.currentTurn).toBe('player:1');
            expect(game.gameState.timer).toBe(30);
            expect(game.gameState.player1Score).toBe(0);
            expect(game.gameState.player2Score).toBe(0);
            expect(game.gameState.player1Tokens).toBe(12);
            expect(game.gameState.player2Tokens).toBe(12);
        });

        it('retourne un deck initialisé avec 5 dés verrouillés', () => {
            const game = GameService.init.gameState();
            expect(game.gameState.deck.dices).toHaveLength(5);
            game.gameState.deck.dices.forEach(dice => {
                expect(dice.value).toBe('');
                expect(dice.locked).toBe(true);
            });
        });

        it('retourne un objet choices initialisé', () => {
            const game = GameService.init.gameState();
            expect(game.gameState.choices.isDefi).toBe(false);
            expect(game.gameState.choices.isSec).toBe(false);
            expect(game.gameState.choices.idSelectedChoice).toBeNull();
            expect(game.gameState.choices.availableChoices).toEqual([]);
        });

        it('retourne une grille 5x5', () => {
            const game = GameService.init.gameState();
            expect(game.gameState.grid).toHaveLength(5);
            game.gameState.grid.forEach(row => {
                expect(row).toHaveLength(5);
            });
        });

        it('crée des instances indépendantes entre deux appels (gameState)', () => {
            const game1 = GameService.init.gameState();
            const game2 = GameService.init.gameState();
            game1.gameState.timer = 10;
            expect(game2.gameState.timer).toBe(30);
        });

        it('crée des instances indépendantes (deck)', () => {
            const game1 = GameService.init.gameState();
            const game2 = GameService.init.gameState();
            game1.gameState.deck.rollsCounter = 99;
            expect(game2.gameState.deck.rollsCounter).toBe(1);
        });

        it('crée des instances indépendantes (choices)', () => {
            const game1 = GameService.init.gameState();
            const game2 = GameService.init.gameState();
            game1.gameState.choices.isDefi = true;
            expect(game2.gameState.choices.isDefi).toBe(false);
        });
    });

    describe('deck', () => {
        it('retourne un deck avec 5 dés et rollsCounter à 1', () => {
            const deck = GameService.init.deck();
            expect(deck.dices).toHaveLength(5);
            expect(deck.rollsCounter).toBe(1);
            expect(deck.rollsMaximum).toBe(3);
        });
    });

    describe('choices', () => {
        it('retourne des choices vides', () => {
            const choices = GameService.init.choices();
            expect(choices.isDefi).toBe(false);
            expect(choices.isSec).toBe(false);
            expect(choices.idSelectedChoice).toBeNull();
            expect(choices.availableChoices).toEqual([]);
        });
    });

    describe('grid', () => {
        it('retourne une deep copy de la grille 5x5', () => {
            const grid1 = GameService.init.grid();
            const grid2 = GameService.init.grid();
            grid1[0][0].owner = 'player:1';
            expect(grid2[0][0].owner).toBeNull();
        });

        it('toutes les cellules ont owner à null', () => {
            const grid = GameService.init.grid();
            grid.forEach(row => {
                row.forEach(cell => {
                    expect(cell.owner).toBeNull();
                    expect(cell.canBeChecked).toBe(false);
                });
            });
        });
    });
});

// =============================================================
// UTILS
// =============================================================
describe('GameService.utils', () => {

    describe('findGameIndexById', () => {
        const games = [
            { idGame: 'aaa' },
            { idGame: 'bbb' },
            { idGame: 'ccc' },
        ];

        it('retourne l\'index du jeu trouvé', () => {
            expect(GameService.utils.findGameIndexById(games, 'bbb')).toBe(1);
        });

        it('retourne -1 si le jeu n\'existe pas', () => {
            expect(GameService.utils.findGameIndexById(games, 'zzz')).toBe(-1);
        });
    });

    describe('findGameIndexBySocketId', () => {
        const games = [
            { player1Socket: { id: 's1' }, player2Socket: { id: 's2' } },
            { player1Socket: { id: 's3' }, player2Socket: { id: 's4' } },
        ];

        it('retourne l\'index quand c\'est player1', () => {
            expect(GameService.utils.findGameIndexBySocketId(games, 's3')).toBe(1);
        });

        it('retourne l\'index quand c\'est player2', () => {
            expect(GameService.utils.findGameIndexBySocketId(games, 's2')).toBe(0);
        });

        it('retourne -1 si le socket n\'existe pas', () => {
            expect(GameService.utils.findGameIndexBySocketId(games, 's99')).toBe(-1);
        });
    });

    describe('findDiceIndexByDiceId', () => {
        const dices = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

        it('retourne l\'index du dé trouvé', () => {
            expect(GameService.utils.findDiceIndexByDiceId(dices, 3)).toBe(2);
        });

        it('retourne -1 si le dé n\'existe pas', () => {
            expect(GameService.utils.findDiceIndexByDiceId(dices, 99)).toBe(-1);
        });
    });
});

// =============================================================
// TIMER
// =============================================================
describe('GameService.timer', () => {

    it('retourne la durée d\'un tour (30s)', () => {
        expect(GameService.timer.getTurnDuration()).toBe(30);
    });

    it('retourne la durée de fin de tour (5s)', () => {
        expect(GameService.timer.getEndTurnDuration()).toBe(5);
    });
});

// =============================================================
// DICES
// =============================================================
describe('GameService.dices', () => {

    describe('roll', () => {
        it('lance les dés vides (value === "") et met locked à false', () => {
            const dices = [
                { id: 1, value: '', locked: true },
                { id: 2, value: '', locked: true },
            ];
            const rolled = GameService.dices.roll(dices);
            rolled.forEach(dice => {
                expect(dice.value).toMatch(/^[1-6]$/);
                expect(dice.locked).toBe(false);
            });
        });

        it('relance les dés non verrouillés', () => {
            const dices = [
                { id: 1, value: '3', locked: false },
            ];
            const rolled = GameService.dices.roll(dices);
            expect(rolled[0].value).toMatch(/^[1-6]$/);
            expect(rolled[0].locked).toBe(false);
        });

        it('ne relance pas les dés verrouillés', () => {
            const dices = [
                { id: 1, value: '5', locked: true },
            ];
            const rolled = GameService.dices.roll(dices);
            expect(rolled[0].value).toBe('5');
            expect(rolled[0].locked).toBe(true);
        });

        it('gère un mix de dés verrouillés et non verrouillés', () => {
            const dices = [
                { id: 1, value: '2', locked: true },
                { id: 2, value: '4', locked: false },
                { id: 3, value: '', locked: true },
            ];
            const rolled = GameService.dices.roll(dices);
            expect(rolled[0].value).toBe('2'); // locked
            expect(rolled[1].value).toMatch(/^[1-6]$/); // relancé
            expect(rolled[2].value).toMatch(/^[1-6]$/); // vide → lancé
        });

        it('ne modifie pas le tableau original (immutabilité)', () => {
            const dices = [{ id: 1, value: '', locked: true }];
            const rolled = GameService.dices.roll(dices);
            expect(dices[0].value).toBe('');
            expect(rolled[0]).not.toBe(dices[0]);
        });
    });

    describe('lockEveryDice', () => {
        it('verrouille tous les dés', () => {
            const dices = [
                { id: 1, value: '3', locked: false },
                { id: 2, value: '5', locked: false },
            ];
            const locked = GameService.dices.lockEveryDice(dices);
            locked.forEach(dice => {
                expect(dice.locked).toBe(true);
            });
        });

        it('conserve les valeurs des dés', () => {
            const dices = [{ id: 1, value: '4', locked: false }];
            const locked = GameService.dices.lockEveryDice(dices);
            expect(locked[0].value).toBe('4');
        });
    });
});

// =============================================================
// CHOICES
// =============================================================
describe('GameService.choices', () => {

    const makeDices = (values) => values.map((v, i) => ({ id: i + 1, value: String(v), locked: false }));

    describe('findCombinations', () => {

        // --- Brelan ---
        it('détecte un brelan de 3', () => {
            const dices = makeDices([3, 3, 3, 1, 5]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'brelan3')).toBe(true);
        });

        it('ne détecte pas un brelan incorrect', () => {
            const dices = makeDices([3, 3, 3, 1, 5]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'brelan1')).toBe(false);
        });

        // --- Full ---
        it('détecte un full (brelan + paire)', () => {
            const dices = makeDices([2, 2, 5, 5, 5]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'full')).toBe(true);
            expect(combos.some(c => c.id === 'brelan5')).toBe(true);
        });

        it('ne détecte pas un full sans paire', () => {
            const dices = makeDices([1, 3, 5, 5, 5]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'full')).toBe(false);
        });

        // --- Carré ---
        it('détecte un carré', () => {
            const dices = makeDices([4, 4, 4, 4, 1]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'carre')).toBe(true);
            expect(combos.some(c => c.id === 'brelan4')).toBe(true);
        });

        // --- Yam ---
        it('détecte un yam (5 identiques)', () => {
            const dices = makeDices([6, 6, 6, 6, 6]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'yam')).toBe(true);
            expect(combos.some(c => c.id === 'carre')).toBe(true);
            expect(combos.some(c => c.id === 'brelan6')).toBe(true);
        });

        // --- Suite ---
        it('détecte la suite 1-2-3-4-5', () => {
            const dices = makeDices([1, 2, 3, 4, 5]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'suite')).toBe(true);
        });

        it('détecte la suite 2-3-4-5-6', () => {
            const dices = makeDices([2, 3, 4, 5, 6]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'suite')).toBe(true);
        });

        it('ne détecte pas de suite avec des doublons', () => {
            const dices = makeDices([1, 2, 3, 4, 4]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'suite')).toBe(false);
        });

        // --- ≤8 ---
        it('détecte ≤8 quand la somme est 8', () => {
            const dices = makeDices([1, 1, 1, 1, 4]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'moinshuit')).toBe(true);
        });

        it('détecte ≤8 quand la somme est inférieure à 8', () => {
            const dices = makeDices([1, 1, 1, 1, 1]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'moinshuit')).toBe(true);
        });

        it('ne détecte pas ≤8 quand la somme dépasse 8', () => {
            const dices = makeDices([2, 2, 2, 2, 2]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'moinshuit')).toBe(false);
        });

        // --- Sec ---
        it('détecte le Sec au premier lancer si combinaison non-brelan', () => {
            const dices = makeDices([1, 2, 3, 4, 5]); // suite
            const combos = GameService.choices.findCombinations(dices, false, true);
            expect(combos.some(c => c.id === 'sec')).toBe(true);
        });

        it('ne détecte pas le Sec si isSec est false', () => {
            const dices = makeDices([1, 2, 3, 4, 5]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'sec')).toBe(false);
        });

        it('ne détecte pas le Sec si seul un brelan est disponible', () => {
            const dices = makeDices([3, 3, 3, 1, 5]);
            const combos = GameService.choices.findCombinations(dices, false, true);
            expect(combos.some(c => c.id === 'sec')).toBe(false);
        });

        // --- Défi ---
        it('détecte le Défi quand isDefi est true', () => {
            const dices = makeDices([1, 2, 3, 4, 6]);
            const combos = GameService.choices.findCombinations(dices, true, false);
            expect(combos.some(c => c.id === 'defi')).toBe(true);
        });

        it('ne détecte pas le Défi quand isDefi est false', () => {
            const dices = makeDices([1, 2, 3, 4, 6]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            expect(combos.some(c => c.id === 'defi')).toBe(false);
        });

        // --- Aucune combinaison ---
        it('retourne un tableau vide si aucune combinaison', () => {
            const dices = makeDices([1, 3, 2, 6, 4]);
            // somme = 16 (pas ≤8), suite 1-2-3-4-6 (pas suite), pas de paire/brelan
            // Attention : 1,2,3,4,6 n'est pas une suite (manque 5)
            // Mais il n'y a pas de brelan ni paire... vérifions
            const combos = GameService.choices.findCombinations(dices, false, false);
            // Pas de brelan, pas de full, pas de carré, pas de yam, pas de suite, pas ≤8
            expect(combos.length).toBe(0);
        });

        // --- Combinaisons multiples ---
        it('détecte plusieurs combinaisons simultanément (yam de 1 = yam + carré + brelan + ≤8)', () => {
            const dices = makeDices([1, 1, 1, 1, 1]);
            const combos = GameService.choices.findCombinations(dices, false, false);
            const ids = combos.map(c => c.id);
            expect(ids).toContain('yam');
            expect(ids).toContain('carre');
            expect(ids).toContain('brelan1');
            expect(ids).toContain('moinshuit');
        });
    });
});

// =============================================================
// GRID
// =============================================================
describe('GameService.grid', () => {

    describe('resetcanBeCheckedCells', () => {
        it('met canBeChecked à false sur toutes les cellules', () => {
            const grid = GameService.init.grid();
            grid[0][0].canBeChecked = true;
            grid[2][3].canBeChecked = true;

            const reset = GameService.grid.resetcanBeCheckedCells(grid);
            reset.forEach(row => {
                row.forEach(cell => {
                    expect(cell.canBeChecked).toBe(false);
                });
            });
        });

        it('ne modifie pas la grille originale (immutabilité)', () => {
            const grid = GameService.init.grid();
            grid[0][0].canBeChecked = true;
            GameService.grid.resetcanBeCheckedCells(grid);
            expect(grid[0][0].canBeChecked).toBe(true);
        });
    });

    describe('updateGridAfterSelectingChoice', () => {
        it('active canBeChecked sur les cellules correspondant au choix', () => {
            const grid = GameService.init.grid();
            // 'brelan1' existe en [0][0] et [3][4]
            const updated = GameService.grid.updateGridAfterSelectingChoice('brelan1', grid);

            let checkedCount = 0;
            updated.forEach(row => {
                row.forEach(cell => {
                    if (cell.id === 'brelan1' && cell.owner === null) {
                        expect(cell.canBeChecked).toBe(true);
                        checkedCount++;
                    }
                });
            });
            expect(checkedCount).toBeGreaterThan(0);
        });

        it('n\'active pas canBeChecked si la cellule a déjà un owner', () => {
            const grid = GameService.init.grid();
            grid[0][0].owner = 'player:1'; // brelan1

            const updated = GameService.grid.updateGridAfterSelectingChoice('brelan1', grid);
            expect(updated[0][0].canBeChecked).toBe(false);
        });
    });

    describe('selectCell', () => {
        it('pose un pion sur la cellule ciblée', () => {
            const grid = GameService.init.grid();
            const updated = GameService.grid.selectCell('brelan1', 0, 0, 'player:1', grid);
            expect(updated[0][0].owner).toBe('player:1');
        });

        it('ne modifie pas les autres cellules', () => {
            const grid = GameService.init.grid();
            const updated = GameService.grid.selectCell('brelan1', 0, 0, 'player:1', grid);
            expect(updated[0][1].owner).toBeNull();
            expect(updated[1][0].owner).toBeNull();
        });
    });

    describe('isAnyCombinationAvailableOnGridForPlayer', () => {
        it('retourne true si une combinaison est disponible sur la grille', () => {
            const game = GameService.init.gameState();
            game.gameState.choices.availableChoices = [{ id: 'brelan1', value: 'Brelan1' }];
            expect(GameService.grid.isAnyCombinationAvailableOnGridForPlayer(game.gameState)).toBe(true);
        });

        it('retourne false si aucune combinaison n\'est disponible', () => {
            const game = GameService.init.gameState();
            game.gameState.choices.availableChoices = [{ id: 'brelan1', value: 'Brelan1' }];
            // Remplir toutes les cellules brelan1
            game.gameState.grid.forEach(row => {
                row.forEach(cell => {
                    if (cell.id === 'brelan1') {
                        cell.owner = 'player:2';
                    }
                });
            });
            expect(GameService.grid.isAnyCombinationAvailableOnGridForPlayer(game.gameState)).toBe(false);
        });

        it('retourne false si availableChoices est vide', () => {
            const game = GameService.init.gameState();
            game.gameState.choices.availableChoices = [];
            expect(GameService.grid.isAnyCombinationAvailableOnGridForPlayer(game.gameState)).toBe(false);
        });
    });
});

// =============================================================
// SEND
// =============================================================
describe('GameService.send', () => {

    const mockGame = {
        player1Socket: { id: 'socket-p1' },
        player2Socket: { id: 'socket-p2' },
        gameState: {
            currentTurn: 'player:1',
            timer: 20,
            deck: {
                dices: [
                    { id: 1, value: '3', locked: false },
                    { id: 2, value: '5', locked: true },
                    { id: 3, value: '1', locked: false },
                    { id: 4, value: '6', locked: false },
                    { id: 5, value: '2', locked: false },
                ],
                rollsCounter: 2,
                rollsMaximum: 3,
            },
            choices: {
                isDefi: false,
                isSec: false,
                idSelectedChoice: 'brelan3',
                availableChoices: [{ id: 'brelan3', value: 'Brelan3' }],
            },
            grid: GameService.init.grid(),
        },
    };

    describe('viewGameState', () => {
        it('retourne l\'état pour player:1', () => {
            const state = GameService.send.forPlayer.viewGameState('player:1', mockGame);
            expect(state.inQueue).toBe(false);
            expect(state.inGame).toBe(true);
            expect(state.idPlayer).toBe('socket-p1');
            expect(state.idOpponent).toBe('socket-p2');
        });

        it('retourne l\'état pour player:2 (inversé)', () => {
            const state = GameService.send.forPlayer.viewGameState('player:2', mockGame);
            expect(state.idPlayer).toBe('socket-p2');
            expect(state.idOpponent).toBe('socket-p1');
        });
    });

    describe('viewQueueState', () => {
        it('retourne inQueue true et inGame false', () => {
            const state = GameService.send.forPlayer.viewQueueState();
            expect(state.inQueue).toBe(true);
            expect(state.inGame).toBe(false);
        });
    });

    describe('gameTimer', () => {
        it('retourne le timer pour le joueur actif', () => {
            const timer = GameService.send.forPlayer.gameTimer('player:1', mockGame.gameState);
            expect(timer.playerTimer).toBe(20);
            expect(timer.opponentTimer).toBe(0);
        });

        it('retourne le timer inversé pour le joueur inactif', () => {
            const timer = GameService.send.forPlayer.gameTimer('player:2', mockGame.gameState);
            expect(timer.playerTimer).toBe(0);
            expect(timer.opponentTimer).toBe(20);
        });
    });

    describe('deckViewState', () => {
        it('affiche le deck du joueur actif', () => {
            const deck = GameService.send.forPlayer.deckViewState('player:1', mockGame.gameState);
            expect(deck.displayPlayerDeck).toBe(true);
            expect(deck.displayOpponentDeck).toBe(false);
            expect(deck.displayRollButton).toBe(true);
            expect(deck.rollsCounter).toBe(2);
            expect(deck.dices).toHaveLength(5);
        });

        it('cache le deck pour le joueur inactif', () => {
            const deck = GameService.send.forPlayer.deckViewState('player:2', mockGame.gameState);
            expect(deck.displayPlayerDeck).toBe(false);
            expect(deck.displayOpponentDeck).toBe(true);
        });
    });

    describe('choicesViewState', () => {
        it('permet au joueur actif de faire un choix', () => {
            const choices = GameService.send.forPlayer.choicesViewState('player:1', mockGame.gameState);
            expect(choices.displayChoices).toBe(true);
            expect(choices.canMakeChoice).toBe(true);
            expect(choices.idSelectedChoice).toBe('brelan3');
        });

        it('empêche le joueur inactif de faire un choix', () => {
            const choices = GameService.send.forPlayer.choicesViewState('player:2', mockGame.gameState);
            expect(choices.canMakeChoice).toBe(false);
        });
    });

    describe('gridViewState', () => {
        it('permet au joueur actif de sélectionner des cellules si des choix existent', () => {
            const grid = GameService.send.forPlayer.gridViewState('player:1', mockGame.gameState);
            expect(grid.displayGrid).toBe(true);
            expect(grid.canSelectCells).toBe(true);
        });

        it('empêche le joueur inactif de sélectionner des cellules', () => {
            const grid = GameService.send.forPlayer.gridViewState('player:2', mockGame.gameState);
            expect(grid.canSelectCells).toBe(false);
        });

        it('empêche la sélection si aucun choix disponible', () => {
            const emptyChoicesState = {
                ...mockGame.gameState,
                choices: { ...mockGame.gameState.choices, availableChoices: [] },
            };
            const grid = GameService.send.forPlayer.gridViewState('player:1', emptyChoicesState);
            expect(grid.canSelectCells).toBe(false);
        });
    });
});

// =============================================================
// SCORES (calculateScores)
// =============================================================
describe('GameService.grid.calculateScores', () => {

    // Helper pour créer une grille avec des owners spécifiques
    const makeGrid = (ownerMap) => {
        const grid = GameService.init.grid();
        for (const [row, col, owner] of ownerMap) {
            grid[row][col].owner = owner;
        }
        return grid;
    };

    it('retourne 0/0 sur une grille vide', () => {
        const grid = GameService.init.grid();
        const scores = GameService.grid.calculateScores(grid);
        expect(scores).toEqual({ player1Score: 0, player2Score: 0 });
    });

    // --- Alignements horizontaux ---
    it('détecte un alignement horizontal de 3 pions (1 point)', () => {
        const grid = makeGrid([
            [0, 0, 'player:1'], [0, 1, 'player:1'], [0, 2, 'player:1'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(1);
    });

    it('détecte un alignement horizontal de 4 pions (2 points)', () => {
        const grid = makeGrid([
            [0, 0, 'player:1'], [0, 1, 'player:1'], [0, 2, 'player:1'], [0, 3, 'player:1'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(2);
    });

    // --- Alignements verticaux ---
    it('détecte un alignement vertical de 3 pions (1 point)', () => {
        const grid = makeGrid([
            [0, 0, 'player:2'], [1, 0, 'player:2'], [2, 0, 'player:2'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player2Score).toBe(1);
    });

    it('détecte un alignement vertical de 4 pions (2 points)', () => {
        const grid = makeGrid([
            [0, 0, 'player:1'], [1, 0, 'player:1'], [2, 0, 'player:1'], [3, 0, 'player:1'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(2);
    });

    // --- Alignements diagonaux ---
    it('détecte un alignement diagonal (\\) de 3 pions (1 point)', () => {
        const grid = makeGrid([
            [0, 0, 'player:1'], [1, 1, 'player:1'], [2, 2, 'player:1'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(1);
    });

    it('détecte un alignement diagonal (/) de 3 pions (1 point)', () => {
        const grid = makeGrid([
            [0, 2, 'player:2'], [1, 1, 'player:2'], [2, 0, 'player:2'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player2Score).toBe(1);
    });

    it('détecte un alignement diagonal de 4 pions (2 points)', () => {
        const grid = makeGrid([
            [0, 0, 'player:1'], [1, 1, 'player:1'], [2, 2, 'player:1'], [3, 3, 'player:1'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(2);
    });

    // --- Cas multiples ---
    it('additionne les points de plusieurs alignements pour un même joueur', () => {
        // Deux alignements de 3 horizontaux sur deux lignes différentes
        const grid = makeGrid([
            [0, 0, 'player:1'], [0, 1, 'player:1'], [0, 2, 'player:1'],
            [2, 0, 'player:1'], [2, 1, 'player:1'], [2, 2, 'player:1'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(2);
    });

    it('calcule les scores des deux joueurs indépendamment', () => {
        const grid = makeGrid([
            [0, 0, 'player:1'], [0, 1, 'player:1'], [0, 2, 'player:1'],
            [4, 0, 'player:2'], [4, 1, 'player:2'], [4, 2, 'player:2'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(1);
        expect(scores.player2Score).toBe(1);
    });

    // --- Pas de double comptage ---
    it('ne compte pas un alignement de 3 inclus dans un alignement de 4', () => {
        // Un alignement de 4 devrait donner 2pts, pas 2+1=3
        const grid = makeGrid([
            [0, 0, 'player:1'], [0, 1, 'player:1'], [0, 2, 'player:1'], [0, 3, 'player:1'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(2);
    });

    // --- 5 alignés ---
    it('détecte un alignement de 5 pions horizontaux', () => {
        const grid = makeGrid([
            [0, 0, 'player:1'], [0, 1, 'player:1'], [0, 2, 'player:1'], [0, 3, 'player:1'], [0, 4, 'player:1'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player1Score).toBe(Infinity);
    });

    it('détecte un alignement de 5 pions en diagonale', () => {
        const grid = makeGrid([
            [0, 0, 'player:2'], [1, 1, 'player:2'], [2, 2, 'player:2'], [3, 3, 'player:2'], [4, 4, 'player:2'],
        ]);
        const scores = GameService.grid.calculateScores(grid);
        expect(scores.player2Score).toBe(Infinity);
    });
});

// =============================================================
// CHECK VICTORY
// =============================================================
describe('GameService.game.checkVictory', () => {

    it('retourne null si la partie continue', () => {
        const gameState = GameService.init.gameState().gameState;
        const result = GameService.game.checkVictory(gameState);
        expect(result).toBeNull();
    });

    it('retourne victoire instantanée pour player:1 avec score Infinity', () => {
        const gameState = GameService.init.gameState().gameState;
        gameState.player1Score = Infinity;
        const result = GameService.game.checkVictory(gameState);
        expect(result).toEqual({
            winner: 'player:1',
            reason: 'alignment5',
            player1Score: Infinity,
            player2Score: 0,
        });
    });

    it('retourne victoire instantanée pour player:2 avec score Infinity', () => {
        const gameState = GameService.init.gameState().gameState;
        gameState.player2Score = Infinity;
        const result = GameService.game.checkVictory(gameState);
        expect(result).toEqual({
            winner: 'player:2',
            reason: 'alignment5',
            player1Score: 0,
            player2Score: Infinity,
        });
    });

    it('retourne le gagnant quand player:1 n\'a plus de pions (player:1 a plus de points)', () => {
        const gameState = GameService.init.gameState().gameState;
        gameState.player1Tokens = 0;
        gameState.player1Score = 5;
        gameState.player2Score = 3;
        const result = GameService.game.checkVictory(gameState);
        expect(result).toEqual({
            winner: 'player:1',
            reason: 'noTokens',
            player1Score: 5,
            player2Score: 3,
        });
    });

    it('retourne le gagnant quand player:2 n\'a plus de pions (player:2 a plus de points)', () => {
        const gameState = GameService.init.gameState().gameState;
        gameState.player2Tokens = 0;
        gameState.player1Score = 2;
        gameState.player2Score = 4;
        const result = GameService.game.checkVictory(gameState);
        expect(result).toEqual({
            winner: 'player:2',
            reason: 'noTokens',
            player1Score: 2,
            player2Score: 4,
        });
    });

    it('retourne égalité quand plus de pions et scores identiques', () => {
        const gameState = GameService.init.gameState().gameState;
        gameState.player1Tokens = 0;
        gameState.player1Score = 3;
        gameState.player2Score = 3;
        const result = GameService.game.checkVictory(gameState);
        expect(result).toEqual({
            winner: null,
            reason: 'noTokens',
            player1Score: 3,
            player2Score: 3,
        });
    });

    it('ne déclenche pas la fin si les deux joueurs ont encore des pions', () => {
        const gameState = GameService.init.gameState().gameState;
        gameState.player1Tokens = 5;
        gameState.player2Tokens = 8;
        gameState.player1Score = 3;
        gameState.player2Score = 1;
        const result = GameService.game.checkVictory(gameState);
        expect(result).toBeNull();
    });
});
