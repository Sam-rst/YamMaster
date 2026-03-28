// backend/src/shared/types.ts — Types partagés du protocole WebSocket et du moteur de jeu

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

export interface SocketLike {
    id: string;
    userId?: string;
    emit: (event: string, ...args: unknown[]) => void;
    on: (event: string, listener: (...args: unknown[]) => void) => void;
}

export interface Game {
    idGame: string;
    dbGameId?: string;
    gameState: GameState;
    player1Socket: SocketLike;
    player2Socket: SocketLike;
    gameInterval?: ReturnType<typeof setInterval>;
    turnRecorder?: {
        recordAction: (action: { type: 'roll' | 'lock' | 'choice' | 'grid' | 'defi' | 'predator' | 'snapshot'; playerNumber: number; data: Record<string, unknown> }) => void;
        recordGameState: (state: Record<string, unknown>) => void;
        toJSON: () => unknown[];
    };
}

export interface VictoryResult {
    winner: PlayerKey | null;
    reason: 'alignment5' | 'noTokens';
    player1Score: number;
    player2Score: number;
}

export interface Scores {
    player1Score: number;
    player2Score: number;
}
