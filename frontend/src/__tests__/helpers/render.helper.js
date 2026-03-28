// frontend/src/__tests__/helpers/render.helper.js
// Helpers de rendu pour les tests d'intégration et E2E

import React from 'react';
import { render } from '@testing-library/react';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

/**
 * Rend un composant avec le SocketContext injecté.
 * Retourne le résultat du render + le mockSocket pour simuler des events.
 */
export const renderWithSocket = (component, mockSocket = null) => {
    const socket = mockSocket || createMockSocket();
    const result = render(
        <SocketContext.Provider value={socket}>
            {component}
        </SocketContext.Provider>
    );
    return { ...result, mockSocket: socket };
};

/**
 * Simule un flow de jeu complet : queue → game.start → dés → choix → grille
 */
export const simulateGameStart = (mockSocket, options = {}) => {
    const { inQueue = false, inGame = true, idOpponent = 'opponent-id' } = options;
    mockSocket.__simulateEvent('game.start', { inQueue, inGame, idOpponent });
};

export const simulateGameEnd = (mockSocket, options = {}) => {
    const {
        winner = 'player:1',
        reason = 'alignment5',
        player1Score = 5,
        player2Score = 3,
    } = options;
    mockSocket.__simulateEvent('game.end', { winner, reason, player1Score, player2Score });
};

export const simulateQueueAdded = (mockSocket) => {
    mockSocket.__simulateEvent('queue.added', { inQueue: true, inGame: false });
};

/**
 * Simule les view-states envoyés par le serveur après un game.start
 */
export const simulateInitialViewStates = (mockSocket) => {
    mockSocket.__simulateEvent('game.timer', {
        playerTimer: 30,
        opponentTimer: 30,
    });
    mockSocket.__simulateEvent('game.deck.view-state', {
        displayPlayerDeck: true,
        displayOpponentDeck: false,
        displayRollButton: true,
        rollsCounter: 1,
        rollsMaximum: 3,
        dpieces: [
            { id: 1, value: '', locked: true },
            { id: 2, value: '', locked: true },
            { id: 3, value: '', locked: true },
            { id: 4, value: '', locked: true },
            { id: 5, value: '', locked: true },
        ],
    });
    mockSocket.__simulateEvent('game.choices.view-state', {
        displayChoices: true,
        canMakeChoice: false,
        idSelectedChoice: null,
        availableChoices: [],
    });
    mockSocket.__simulateEvent('game.grid.view-state', {
        displayGrid: true,
        canSelectCells: false,
        grid: [],
    });
    mockSocket.__simulateEvent('game.score', {
        playerScore: 0,
        opponentScore: 0,
        playerTokens: 12,
        opponentTokens: 12,
    });
};
