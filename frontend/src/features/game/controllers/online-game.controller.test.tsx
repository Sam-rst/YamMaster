import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import OnlineGameController from './online-game.controller';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

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
        expect(getByText(/Victoire|Défaite|Égalité/i)).toBeTruthy();
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

        expect(getByText('Menu Principal')).toBeTruthy();
    });

    it('le bouton "Retour au menu" navigue vers HomeScreen en état waiting', () => {
        const navigation = { navigate: jest.fn() };
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController navigation={navigation} />
            </SocketContext.Provider>
        );

        fireEvent.click(getByText('Retour au menu'));
        expect(navigation.navigate).toHaveBeenCalledWith('HomeScreen');
    });

    it('le bouton "Retour au menu" navigue vers HomeScreen en file d\'attente', () => {
        const navigation = { navigate: jest.fn() };
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController navigation={navigation} />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('queue.added', { inQueue: true, inGame: false });
        });

        fireEvent.click(getByText('Retour au menu'));
        expect(navigation.navigate).toHaveBeenCalledWith('HomeScreen');
    });

    it('le bouton "Rejouer" après game.end émet queue.join et réinitialise l\'état', () => {
        const navigation = { navigate: jest.fn() };
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController navigation={navigation} />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'opp',
            });
        });
        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:1', reason: 'alignment5',
                player1Score: 5, player2Score: 3,
            });
        });

        mockSocket.emit.mockClear();
        fireEvent.click(getByText('Rejouer'));

        expect(mockSocket.emit).toHaveBeenCalledWith('queue.join');
    });

    it('le bouton "Retour au menu" après game.end navigue vers HomeScreen', () => {
        const navigation = { navigate: jest.fn() };
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController navigation={navigation} />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'opp',
            });
        });
        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:1', reason: 'alignment5',
                player1Score: 5, player2Score: 3,
            });
        });

        fireEvent.click(getByText('Menu Principal'));
        expect(navigation.navigate).toHaveBeenCalledWith('HomeScreen');
    });

    it('game.end avec reason noTokens affiche "Plus de pions disponibles"', () => {
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
                winner: 'player:1', reason: 'noTokens',
                player1Score: 4, player2Score: 2,
            });
        });

        expect(getByText(/Plus de pions disponibles/)).toBeTruthy();
    });

    it('game.end sans vainqueur affiche "Égalité !"', () => {
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
                winner: null, reason: 'noTokens',
                player1Score: 3, player2Score: 3,
            });
        });

        expect(getByText('Égalité !')).toBeTruthy();
    });

    it('appelle socket.off pour les 3 événements au démontage', () => {
        const { unmount } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );

        unmount();

        const offEvents = mockSocket.off.mock.calls.map(call => call[0]);
        expect(offEvents).toContain('queue.added');
        expect(offEvents).toContain('game.start');
        expect(offEvents).toContain('game.end');
    });
});
