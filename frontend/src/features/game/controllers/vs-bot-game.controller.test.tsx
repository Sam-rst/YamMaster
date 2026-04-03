import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import VsBotGameController from './vs-bot-game.controller';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

let lastBoardProps: Record<string, unknown> = {};
jest.mock('../components/board/board.component', () => {
    const React = require('react');
    return function MockBoard(props: Record<string, unknown>) {
        lastBoardProps = props;
        return React.createElement('Text', {}, 'MockBoard');
    };
});

describe('VsBotGameController', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
        lastBoardProps = {};
    });

    it('émet game.vsbot à l\'initialisation', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );
        expect(mockSocket.emit).toHaveBeenCalledWith('game.vsbot', { difficulty: 'MEDIUM' });
    });

    it('affiche un message de chargement initialement', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );
        expect(getByText(/Lancement/)).toBeTruthy();
    });

    it('affiche le Board après game.start', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false,
                inGame: true,
                idOpponent: 'bot-id',
            });
        });

        expect(getByText('MockBoard')).toBeTruthy();
    });

    it('affiche l\'écran de fin après game.end', () => {
        const { getByText, queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'bot-id',
            });
        });

        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:1',
                reason: 'alignment5',
                player1Score: Infinity,
                player2Score: 2,
            });
        });

        expect(queryByText('MockBoard')).toBeNull();
        expect(getByText(/Victoire|Défaite|Égalité/i)).toBeTruthy();
        expect(getByText('Menu Principal')).toBeTruthy();
        expect(getByText('Rejouer')).toBeTruthy();
    });

    it('passe opponentInfo au Board après game.start', () => {
        const opponent = { username: 'Bot Facile', avatar: '🤖', rank: null };
        render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false,
                inGame: true,
                idOpponent: 'bot-id',
                opponent,
            });
        });

        expect(lastBoardProps.opponentInfo).toEqual(opponent);
    });

    it('écoute game.start et game.end', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );
        const events = mockSocket.on.mock.calls.map(call => call[0]);
        expect(events).toContain('game.start');
        expect(events).toContain('game.end');
    });

    it('le bouton "Rejouer" après game.end émet game.vsbot et réinitialise l\'état', () => {
        const navigation = { navigate: jest.fn() };
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController navigation={navigation} />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'bot-id',
            });
        });
        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:1', reason: 'alignment5',
                player1Score: 5, player2Score: 2,
            });
        });

        mockSocket.emit.mockClear();
        fireEvent.click(getByText('Rejouer'));

        expect(mockSocket.emit).toHaveBeenCalledWith('game.vsbot', { difficulty: 'MEDIUM' });
    });

    it('le bouton "Retour au menu" après game.end navigue vers HomeScreen', () => {
        const navigation = { navigate: jest.fn() };
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController navigation={navigation} />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'bot-id',
            });
        });
        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:1', reason: 'alignment5',
                player1Score: 5, player2Score: 2,
            });
        });

        fireEvent.click(getByText('Menu Principal'));
        expect(navigation.navigate).toHaveBeenCalledWith('HomeScreen');
    });

    it('game.end avec winner player:2 affiche "Défaite"', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'bot-id',
            });
        });
        act(() => {
            mockSocket.__simulateEvent('game.end', {
                winner: 'player:2', reason: 'alignment5',
                player1Score: 2, player2Score: 5,
            });
        });

        expect(getByText(/Défaite/i)).toBeTruthy();
    });

    it('game.end sans vainqueur affiche "Égalité !"', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.start', {
                inQueue: false, inGame: true, idOpponent: 'bot-id',
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

    it('appelle socket.off pour game.start et game.end au démontage', () => {
        const { unmount } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );

        unmount();

        const offEvents = mockSocket.off.mock.calls.map(call => call[0]);
        expect(offEvents).toContain('game.start');
        expect(offEvents).toContain('game.end');
    });
});
