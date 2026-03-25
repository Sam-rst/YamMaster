// backend/src/features/game/services/game.service.ts

import {
    Dice, Combination, Grid, Choices, Deck,
    GameState, Game, PlayerKey, VictoryResult, Scores
} from '../../../shared/types';

const TURN_DURATION = 30;
const END_TURN_DURATION = 5;

const DECK_INIT: Deck = {
    dices: [
        { id: 1, value: '', locked: true },
        { id: 2, value: '', locked: true },
        { id: 3, value: '', locked: true },
        { id: 4, value: '', locked: true },
        { id: 5, value: '', locked: true },
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const CHOICES_INIT: Choices = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const ALL_COMBINATIONS: Combination[] = [
    { value: 'Brelan1', id: 'brelan1' },
    { value: 'Brelan2', id: 'brelan2' },
    { value: 'Brelan3', id: 'brelan3' },
    { value: 'Brelan4', id: 'brelan4' },
    { value: 'Brelan5', id: 'brelan5' },
    { value: 'Brelan6', id: 'brelan6' },
    { value: 'Full', id: 'full' },
    { value: 'Carré', id: 'carre' },
    { value: 'Yam', id: 'yam' },
    { value: 'Suite', id: 'suite' },
    { value: '≤8', id: 'moinshuit' },
    { value: 'Sec', id: 'sec' },
    { value: 'Défi', id: 'defi' }
];

const GRID_INIT: Grid = [
    [
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
    ]
];

const GameService = {

    init: {
        gameState: (): { gameState: GameState } => {
            return {
                gameState: {
                    currentTurn: 'player:1' as PlayerKey,
                    timer: TURN_DURATION,
                    player1Score: 0,
                    player2Score: 0,
                    player1Tokens: 12,
                    player2Tokens: 12,
                    grid: GRID_INIT.map(row => row.map(cell => ({ ...cell }))),
                    choices: { ...CHOICES_INIT, availableChoices: [] as Combination[] },
                    deck: { ...DECK_INIT, dices: DECK_INIT.dices.map(d => ({ ...d })) },
                }
            };
        },

        deck: (): Deck => {
            return { ...DECK_INIT, dices: DECK_INIT.dices.map(d => ({ ...d })) };
        },

        choices: (): Choices => {
            return { ...CHOICES_INIT, availableChoices: [] as Combination[] };
        },

        grid: (): Grid => {
            return GRID_INIT.map(row => row.map(cell => ({ ...cell })));
        }
    },

    send: {
        forPlayer: {
            viewGameState: (playerKey: PlayerKey, game: Game) => {
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer: playerKey === 'player:1' ? game.player1Socket.id : game.player2Socket.id,
                    idOpponent: playerKey === 'player:1' ? game.player2Socket.id : game.player1Socket.id,
                };
            },

            viewQueueState: () => {
                return { inQueue: true, inGame: false };
            },

            gameTimer: (playerKey: PlayerKey, gameState: GameState) => {
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                return { playerTimer, opponentTimer };
            },

            deckViewState: (playerKey: PlayerKey, gameState: GameState) => {
                return {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayOpponentDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
            },

            choicesViewState: (playerKey: PlayerKey, gameState: GameState) => {
                return {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices,
                    isDefi: gameState.choices.isDefi,
                    rollsCounter: gameState.deck.rollsCounter,
                    hasYam: gameState.choices.availableChoices.some(c => c.id === 'yam'),
                };
            },

            gridViewState: (playerKey: PlayerKey, gameState: GameState) => {
                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid
                };
            },

            scoreViewState: (playerKey: PlayerKey, gameState: GameState) => {
                const isPlayer1 = playerKey === 'player:1';
                return {
                    playerScore: isPlayer1 ? gameState.player1Score : gameState.player2Score,
                    opponentScore: isPlayer1 ? gameState.player2Score : gameState.player1Score,
                    playerTokens: isPlayer1 ? gameState.player1Tokens : gameState.player2Tokens,
                    opponentTokens: isPlayer1 ? gameState.player2Tokens : gameState.player1Tokens,
                };
            }
        }
    },

    utils: {
        findGameIndexById: (games: Game[], idGame: string): number => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) return i;
            }
            return -1;
        },

        findGameIndexBySocketId: (games: Game[], socketId: string): number => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].player1Socket.id === socketId || games[i].player2Socket.id === socketId) return i;
            }
            return -1;
        },

        findDiceIndexByDiceId: (dices: Dice[], idDice: number): number => {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i].id === idDice) return i;
            }
            return -1;
        },
    },

    timer: {
        getTurnDuration: (): number => TURN_DURATION,
        getEndTurnDuration: (): number => END_TURN_DURATION,
    },

    dices: {
        roll: (dicesToRoll: Dice[]): Dice[] => {
            return dicesToRoll.map(dice => {
                if (dice.value === '') {
                    return { id: dice.id, value: String(Math.floor(Math.random() * 6) + 1), locked: false };
                } else if (!dice.locked) {
                    return { ...dice, value: String(Math.floor(Math.random() * 6) + 1) };
                } else {
                    return dice;
                }
            });
        },

        lockEveryDice: (dicesToLock: Dice[]): Dice[] => {
            return dicesToLock.map(dice => ({ ...dice, locked: true }));
        }
    },

    choices: {
        findCombinations: (dices: Dice[], isDefi: boolean, isSec: boolean): Combination[] => {
            const availableCombinations: Combination[] = [];

            const counts = Array(7).fill(0) as number[];
            let hasPair = false;
            let threeOfAKindValue: number | null = null;
            let hasThreeOfAKind = false;
            let hasFourOfAKind = false;
            let hasFiveOfAKind = false;
            let sum = 0;

            for (const dice of dices) {
                const diceValue = parseInt(dice.value);
                counts[diceValue]++;
                sum += diceValue;
            }

            for (let i = 1; i <= 6; i++) {
                if (counts[i] === 2) {
                    hasPair = true;
                } else if (counts[i] === 3) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                } else if (counts[i] === 4) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                } else if (counts[i] === 5) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                    hasFiveOfAKind = true;
                }
            }

            const sortedValues = dices.map(dice => parseInt(dice.value)).sort((a, b) => a - b);
            const hasStraight = sortedValues.every((value, index) => index === 0 || value === sortedValues[index - 1] + 1);
            const isLessThanEqual8 = sum <= 8;

            for (const combination of ALL_COMBINATIONS) {
                if (
                    (combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1)) === threeOfAKindValue) ||
                    (combination.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combination.id === 'carre' && hasFourOfAKind) ||
                    (combination.id === 'yam' && hasFiveOfAKind) ||
                    (combination.id === 'suite' && hasStraight) ||
                    (combination.id === 'moinshuit' && isLessThanEqual8)
                ) {
                    availableCombinations.push(combination);
                }
            }

            const notOnlyBrelan = availableCombinations.some(c => !c.id.includes('brelan'));

            if (isSec && availableCombinations.length > 0 && notOnlyBrelan) {
                const sec = ALL_COMBINATIONS.find(c => c.id === 'sec');
                if (sec) availableCombinations.push(sec);
            }

            if (isDefi && notOnlyBrelan) {
                const defi = ALL_COMBINATIONS.find(c => c.id === 'defi');
                if (defi) availableCombinations.push(defi);
            }

            return availableCombinations;
        }
    },

    grid: {
        calculateScores: (grid: Grid): Scores => {
            const scores: Scores = { player1Score: 0, player2Score: 0 };
            const size = grid.length;

            const checkLine = (cells: (PlayerKey | null)[]) => {
                let current: PlayerKey | null = null;
                let count = 0;
                const segments: { owner: PlayerKey; length: number }[] = [];

                for (const cell of cells) {
                    if (cell !== null && cell === current) {
                        count++;
                    } else {
                        if (current !== null && count >= 3) {
                            segments.push({ owner: current, length: count });
                        }
                        current = cell;
                        count = 1;
                    }
                }
                if (current !== null && count >= 3) {
                    segments.push({ owner: current, length: count });
                }
                return segments;
            };

            const allSegments: { owner: PlayerKey; length: number }[] = [];

            for (let r = 0; r < size; r++) {
                allSegments.push(...checkLine(grid[r].map(cell => cell.owner)));
            }
            for (let c = 0; c < size; c++) {
                const owners: (PlayerKey | null)[] = [];
                for (let r = 0; r < size; r++) owners.push(grid[r][c].owner);
                allSegments.push(...checkLine(owners));
            }
            for (let start = -(size - 3); start <= size - 3; start++) {
                const owners: (PlayerKey | null)[] = [];
                for (let i = 0; i < size; i++) {
                    const c = i + start;
                    if (c >= 0 && c < size) owners.push(grid[i][c].owner);
                }
                allSegments.push(...checkLine(owners));
            }
            for (let start = 2; start <= 2 * (size - 1) - 2; start++) {
                const owners: (PlayerKey | null)[] = [];
                for (let i = 0; i < size; i++) {
                    const c = start - i;
                    if (c >= 0 && c < size) owners.push(grid[i][c].owner);
                }
                allSegments.push(...checkLine(owners));
            }

            for (const seg of allSegments) {
                const key = seg.owner === 'player:1' ? 'player1Score' : 'player2Score';
                if (seg.length >= 5) scores[key] = Infinity;
                else if (seg.length === 4) scores[key] += 2;
                else if (seg.length === 3) scores[key] += 1;
            }

            return scores;
        },

        resetcanBeCheckedCells: (grid: Grid): Grid => {
            return grid.map(row => row.map(cell => ({ ...cell, canBeChecked: false })));
        },

        updateGridAfterSelectingChoice: (idSelectedChoice: string, grid: Grid): Grid => {
            return grid.map(row => row.map(cell => {
                if (cell.id === idSelectedChoice && cell.owner === null) {
                    return { ...cell, canBeChecked: true };
                }
                return cell;
            }));
        },

        selectCell: (idCell: string, rowIndex: number, cellIndex: number, currentTurn: PlayerKey, grid: Grid): Grid => {
            return grid.map((row, rIdx) => row.map((cell, cIdx) => {
                if (cell.id === idCell && rIdx === rowIndex && cIdx === cellIndex) {
                    return { ...cell, owner: currentTurn };
                }
                return cell;
            }));
        },

        isAnyCombinationAvailableOnGridForPlayer: (gameState: GameState): boolean => {
            const { grid } = gameState;
            const { availableChoices } = gameState.choices;
            for (const row of grid) {
                for (const cell of row) {
                    if (cell.owner === null) {
                        for (const combination of availableChoices) {
                            if (cell.id === combination.id) return true;
                        }
                    }
                }
            }
            return false;
        },

        yamPredator: (rowIndex: number, cellIndex: number, grid: Grid): Grid => {
            return grid.map((row, rIdx) => row.map((cell, cIdx) => {
                if (rIdx === rowIndex && cIdx === cellIndex) {
                    return { ...cell, owner: null };
                }
                return { ...cell };
            }));
        },
    },

    game: {
        checkVictory: (gameState: GameState): VictoryResult | null => {
            const { player1Score, player2Score, player1Tokens, player2Tokens } = gameState;

            if (player1Score === Infinity) {
                return { winner: 'player:1', reason: 'alignment5', player1Score, player2Score };
            }
            if (player2Score === Infinity) {
                return { winner: 'player:2', reason: 'alignment5', player1Score, player2Score };
            }
            if (player1Tokens <= 0 || player2Tokens <= 0) {
                let winner: PlayerKey | null = null;
                if (player1Score > player2Score) winner = 'player:1';
                else if (player2Score > player1Score) winner = 'player:2';
                return { winner, reason: 'noTokens', player1Score, player2Score };
            }
            return null;
        }
    },
};

export default GameService;
