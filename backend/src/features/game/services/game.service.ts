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

interface DiceAnalysis {
    counts: number[];
    hasPair: boolean;
    threeOfAKindValue: number | null;
    hasThreeOfAKind: boolean;
    hasFourOfAKind: boolean;
    hasFiveOfAKind: boolean;
    hasStraight: boolean;
    isLessThanEqual8: boolean;
}

type Segment = { owner: PlayerKey; length: number };

const analyzeDice = (dices: Dice[]): DiceAnalysis => {
    const counts = new Array<number>(7).fill(0);
    let sum = 0;

    for (const dice of dices) {
        const diceValue = Number.parseInt(dice.value);
        counts[diceValue]++;
        sum += diceValue;
    }

    let hasPair = false;
    let threeOfAKindValue: number | null = null;
    let hasThreeOfAKind = false;
    let hasFourOfAKind = false;
    let hasFiveOfAKind = false;

    for (let i = 1; i <= 6; i++) {
        if (counts[i] >= 5) {
            hasFiveOfAKind = true;
            hasFourOfAKind = true;
            hasThreeOfAKind = true;
            threeOfAKindValue = i;
        } else if (counts[i] >= 4) {
            hasFourOfAKind = true;
            hasThreeOfAKind = true;
            threeOfAKindValue = i;
        } else if (counts[i] >= 3) {
            hasThreeOfAKind = true;
            threeOfAKindValue = i;
        } else if (counts[i] === 2) {
            hasPair = true;
        }
    }

    const sortedValues = dices.map(dice => Number.parseInt(dice.value)).sort((a, b) => a - b);
    const hasStraight = sortedValues.every((value, index) => index === 0 || value === sortedValues[index - 1] + 1);

    return { counts, hasPair, threeOfAKindValue, hasThreeOfAKind, hasFourOfAKind, hasFiveOfAKind, hasStraight, isLessThanEqual8: sum <= 8 };
};

const matchesCombination = (combination: Combination, analysis: DiceAnalysis): boolean => {
    if (combination.id.includes('brelan')) {
        return analysis.hasThreeOfAKind && Number.parseInt(combination.id.slice(-1)) === analysis.threeOfAKindValue;
    }
    if (combination.id === 'full') return analysis.hasPair && analysis.hasThreeOfAKind;
    if (combination.id === 'carre') return analysis.hasFourOfAKind;
    if (combination.id === 'yam') return analysis.hasFiveOfAKind;
    if (combination.id === 'suite') return analysis.hasStraight;
    if (combination.id === 'moinshuit') return analysis.isLessThanEqual8;
    return false;
};

const checkLine = (cells: (PlayerKey | null)[]): Segment[] => {
    let current: PlayerKey | null = null;
    let count = 0;
    const segments: Segment[] = [];

    for (const cell of cells) {
        if (cell !== null && cell === current) {
            count++;
            continue;
        }
        if (current !== null && count >= 3) {
            segments.push({ owner: current, length: count });
        }
        current = cell;
        count = 1;
    }
    if (current !== null && count >= 3) {
        segments.push({ owner: current, length: count });
    }
    return segments;
};

const collectRows = (grid: Grid, size: number): (PlayerKey | null)[][] => {
    return grid.map(row => row.map(cell => cell.owner));
};

const collectColumns = (grid: Grid, size: number): (PlayerKey | null)[][] => {
    const lines: (PlayerKey | null)[][] = [];
    for (let c = 0; c < size; c++) {
        const owners: (PlayerKey | null)[] = [];
        for (let r = 0; r < size; r++) owners.push(grid[r][c].owner);
        lines.push(owners);
    }
    return lines;
};

const collectDiagonals = (grid: Grid, size: number): (PlayerKey | null)[][] => {
    const lines: (PlayerKey | null)[][] = [];
    for (let start = -(size - 3); start <= size - 3; start++) {
        const owners: (PlayerKey | null)[] = [];
        for (let i = 0; i < size; i++) {
            const c = i + start;
            if (c >= 0 && c < size) owners.push(grid[i][c].owner);
        }
        lines.push(owners);
    }
    return lines;
};

const collectAntiDiagonals = (grid: Grid, size: number): (PlayerKey | null)[][] => {
    const lines: (PlayerKey | null)[][] = [];
    for (let start = 2; start <= 2 * (size - 1) - 2; start++) {
        const owners: (PlayerKey | null)[] = [];
        for (let i = 0; i < size; i++) {
            const c = start - i;
            if (c >= 0 && c < size) owners.push(grid[i][c].owner);
        }
        lines.push(owners);
    }
    return lines;
};

const scoreSegment = (segment: Segment): number => {
    if (segment.length >= 5) return Infinity;
    if (segment.length === 4) return 2;
    if (segment.length === 3) return 1;
    return 0;
};

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

            viewQueueState: () => {
                return { inQueue: true, inGame: false };
            },

            gameTimer: (playerKey: PlayerKey, gameState: GameState) => {
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                return { playerTimer, opponentTimer };
            },

            deckViewState: (playerKey: PlayerKey, gameState: GameState) => {
                const isMyTurn = gameState.currentTurn === playerKey;
                const hasRollsLeft = gameState.deck.rollsCounter <= gameState.deck.rollsMaximum;

                return {
                    displayPlayerDeck: isMyTurn,
                    displayOpponentDeck: !isMyTurn,
                    displayRollButton: hasRollsLeft,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices,
                    canRoll: isMyTurn && hasRollsLeft,
                    canLockDice: isMyTurn && hasRollsLeft,
                };
            },

            choicesViewState: (playerKey: PlayerKey, gameState: GameState) => {
                const isMyTurn = playerKey === gameState.currentTurn;
                const hasYam = gameState.choices.availableChoices.some(c => c.id === 'yam');

                return {
                    displayChoices: true,
                    canMakeChoice: isMyTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices,
                    isDefi: gameState.choices.isDefi,
                    canDefi: isMyTurn && gameState.deck.rollsCounter >= 2 && !gameState.choices.isDefi,
                    canYamPredator: isMyTurn && hasYam,
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
                } else if (dice.locked) {
                    return dice;
                } else {
                    return { ...dice, value: String(Math.floor(Math.random() * 6) + 1) };
                }
            });
        },

        lockEveryDice: (dicesToLock: Dice[]): Dice[] => {
            return dicesToLock.map(dice => ({ ...dice, locked: true }));
        }
    },

    choices: {
        findCombinations: (dices: Dice[], isDefi: boolean, isSec: boolean): Combination[] => {
            const analysis = analyzeDice(dices);

            const availableCombinations = ALL_COMBINATIONS.filter(
                combination => matchesCombination(combination, analysis)
            );

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

            const allLines = [
                ...collectRows(grid, size),
                ...collectColumns(grid, size),
                ...collectDiagonals(grid, size),
                ...collectAntiDiagonals(grid, size),
            ];

            const allSegments = allLines.flatMap(line => checkLine(line));

            for (const seg of allSegments) {
                const key = seg.owner === 'player:1' ? 'player1Score' : 'player2Score';
                scores[key] += scoreSegment(seg);
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
