import React from 'react';
import { render, act } from '@testing-library/react';
import OnlineGameController from './online-game.controller';
import { SocketContext } from '../contexts/socket.context';
import { createMockSocket } from '../__mocks__/socket.mock';

jest.mock('../components/board/board.component', () => {
    const React = require('react');
    return function MockBoard() {
        return React.createElement('Text', {}, 'MockBoard');
    };
});

describe('OnlineGameController', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('émet queue.join à l\'initialisation', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );
        expect(mockSocket.emit).toHaveBeenCalledWith('queue.join');
    });

    it('affiche un message d\'attente initialement', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );
        expect(getByText('Waiting for server datas...')).toBeTruthy();
    });

    it('affiche l\'état de file d\'attente après queue.added', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('queue.added', { inQueue: true, inGame: false });
        });

        expect(getByText('Waiting for another player...')).toBeTruthy();
    });

    it('affiche le Board après game.start', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false,
                inGame: true,
                idOpponent: 'opponent-id',
            });
        });

        expect(getByText('MockBoard')).toBeTruthy();
    });

    it('écoute les événements queue.added, game.start et game.end', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );
        const events = mockSocket.on.mock.calls.map(call => call[0]);
        expect(events).toContain('queue.added');
        expect(events).toContain('game.start');
        expect(events).toContain('game.end');
    });

    it('affiche l\'écran de fin de partie après game.end avec un vainqueur', () => {
        const { getByText, queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );

        // Démarrer la partie
        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false,
                inGame: true,
                idOpponent: 'opponent-id',
            });
        });

        // Fin de partie
        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:1',
                reason: 'alignment5',
                player1Score: Infinity,
                player2Score: 3,
            });
        });

        expect(queryByText('MockBoard')).toBeNull();
        expect(getByText(/Fin de la partie/)).toBeTruthy();
        expect(getByText(/player:1/)).toBeTruthy();
    });

    it('affiche un bouton retour au menu après game.end', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'opp',
            });
        });

        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:2',
                reason: 'noTokens',
                player1Score: 2,
                player2Score: 5,
            });
        });

        expect(getByText('Retour au menu')).toBeTruthy();
    });
});
