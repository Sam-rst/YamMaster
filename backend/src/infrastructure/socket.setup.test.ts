// backend/src/infrastructure/socket.setup.test.ts
// Tests unitaires pour les fonctions utilitaires du socket setup

import { getPlayerKeyFromSocket, isCurrentPlayerTurn } from './socket.setup';
import { createMockGame } from '../__tests__/helpers/game.helper';

describe('Socket Setup - getPlayerKeyFromSocket', () => {
    test('retourne player:1 pour le socket du joueur 1', () => {
        const { game } = createMockGame({ player1Id: 'socket-p1', player2Id: 'socket-p2' });
        expect(getPlayerKeyFromSocket(game, 'socket-p1')).toBe('player:1');
    });

    test('retourne player:2 pour le socket du joueur 2', () => {
        const { game } = createMockGame({ player1Id: 'socket-p1', player2Id: 'socket-p2' });
        expect(getPlayerKeyFromSocket(game, 'socket-p2')).toBe('player:2');
    });

    test('retourne null pour un socket inconnu', () => {
        const { game } = createMockGame({ player1Id: 'socket-p1', player2Id: 'socket-p2' });
        expect(getPlayerKeyFromSocket(game, 'socket-unknown')).toBeNull();
    });
});

describe('Socket Setup - isCurrentPlayerTurn', () => {
    test('retourne true si c\'est le tour du joueur correspondant au socket', () => {
        const { game } = createMockGame({ player1Id: 'socket-p1', player2Id: 'socket-p2' });
        game.gameState.currentTurn = 'player:1';
        expect(isCurrentPlayerTurn(game, 'socket-p1')).toBe(true);
    });

    test('retourne false si ce n\'est pas le tour du joueur', () => {
        const { game } = createMockGame({ player1Id: 'socket-p1', player2Id: 'socket-p2' });
        game.gameState.currentTurn = 'player:1';
        expect(isCurrentPlayerTurn(game, 'socket-p2')).toBe(false);
    });

    test('retourne false pour un socket inconnu', () => {
        const { game } = createMockGame({ player1Id: 'socket-p1', player2Id: 'socket-p2' });
        game.gameState.currentTurn = 'player:1';
        expect(isCurrentPlayerTurn(game, 'socket-unknown')).toBe(false);
    });

    test('fonctionne pour player:2', () => {
        const { game } = createMockGame({ player1Id: 'socket-p1', player2Id: 'socket-p2' });
        game.gameState.currentTurn = 'player:2';
        expect(isCurrentPlayerTurn(game, 'socket-p2')).toBe(true);
        expect(isCurrentPlayerTurn(game, 'socket-p1')).toBe(false);
    });
});
