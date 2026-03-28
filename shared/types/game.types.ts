// shared/types/game.types.ts
// Types métier du jeu — source de vérité partagée entre backend et frontend
// NOTE: Ces types doivent rester synchronisés avec backend/src/shared/types.ts

export type PlayerKey = 'player:1' | 'player:2';

export interface Dice {
    id: number;
    value: string;
    locked: boolean;
}

export interface Combination {
    value: string;
    id: string;
}

export interface GridCell {
    viewContent: string;
    id: string;
    owner: PlayerKey | null;
    canBeChecked: boolean;
}

export type Grid = GridCell[][];

export interface Choices {
    isDefi: boolean;
    isSec: boolean;
    idSelectedChoice: string | null;
    availableChoices: Combination[];
}

export interface Deck {
    dices: Dice[];
    rollsCounter: number;
    rollsMaximum: number;
}

export interface GameState {
    currentTurn: PlayerKey;
    timer: number;
    player1Score: number;
    player2Score: number;
    player1Tokens: number;
    player2Tokens: number;
    grid: Grid;
    choices: Choices;
    deck: Deck;
}

export interface VictoryResult {
    winner: PlayerKey | null;
    reason: 'alignment5' | 'noTokens';
    player1Score: number;
    player2Score: number;
    isWinner?: boolean;
    isDraw?: boolean;
    opponentName?: string;
}

export interface Scores {
    player1Score: number;
    player2Score: number;
}
