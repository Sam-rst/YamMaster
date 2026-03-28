// shared/types/socket-events.types.ts
// Types des événements Socket.IO — contrat entre client et serveur

import { Dice, Combination, GridCell, PlayerKey, VictoryResult } from './game.types';

// ================================================================
// SERVER → CLIENT (le client écoute ces événements)
// ================================================================

export interface ServerToClientEvents {
    'queue.added': (data: QueueAddedPayload) => void;
    'game.start': (data: GameStartPayload) => void;
    'game.end': (data: VictoryResult) => void;
    'game.timer': (data: TimerPayload) => void;
    'game.deck.view-state': (data: DeckViewStatePayload) => void;
    'game.choices.view-state': (data: ChoicesViewStatePayload) => void;
    'game.grid.view-state': (data: GridViewStatePayload) => void;
    'game.score': (data: ScoreViewStatePayload) => void;
}

// ================================================================
// CLIENT → SERVER (le client émet ces événements)
// ================================================================

export interface ClientToServerEvents {
    'queue.join': () => void;
    'game.vsbot': () => void;
    'game.dices.roll': () => void;
    'game.dices.lock': (diceId: number) => void;
    'game.defi': () => void;
    'game.choices.selected': (data: { choiceId: string }) => void;
    'game.grid.selected': (data: { cellId: string; rowIndex: number; cellIndex: number }) => void;
    'game.grid.yamPredator': (data: { rowIndex: number; cellIndex: number }) => void;
    'game.dev.place': (data: { rowIndex: number; cellIndex: number; owner: PlayerKey }) => void;
}

// ================================================================
// PAYLOADS — Structure des données échangées
// ================================================================

export interface QueueAddedPayload {
    inQueue: boolean;
    inGame: boolean;
}

export interface GameStartPayload {
    inQueue: boolean;
    inGame: boolean;
    idOpponent: string;
}

export interface TimerPayload {
    playerTimer: number;
    opponentTimer: number;
}

export interface DeckViewStatePayload {
    displayPlayerDeck: boolean;
    displayOpponentDeck: boolean;
    displayRollButton: boolean;
    rollsCounter: number;
    rollsMaximum: number;
    dpieces: Dice[];
}

export interface ChoicesViewStatePayload {
    displayChoices: boolean;
    canMakeChoice: boolean;
    idSelectedChoice: string | null;
    availableChoices: Combination[];
}

export interface GridViewStatePayload {
    displayGrid: boolean;
    canSelectCells: boolean;
    grid: GridCell[][];
}

export interface ScoreViewStatePayload {
    playerScore: number;
    opponentScore: number;
    playerTokens: number;
    opponentTokens: number;
}
