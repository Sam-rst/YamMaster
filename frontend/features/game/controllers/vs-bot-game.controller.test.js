import React from 'react';
import { render, act } from '@testing-library/react';
import VsBotGameController from './vs-bot-game.controller';
import { SocketContext } from '../../../shared/contexts/socket.context';
import { createMockSocket } from '../../../__mocks__/socket.mock';

jest.mock('../components/board/board.component', () => {
    const React = require('react');
    return function MockBoard() {
        return React.createElement('Text', {}, 'MockBoard');
    };
});

describe('VsBotGameController', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('émet game.vsbot à l\'initialisation', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameController />
            </SocketContext.Provider>
        );
        expect(mockSocket.emit).toHaveBeenCalledWith('game.vsbot');
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
        expect(getByText(/Fin de la partie/)).toBeTruthy();
        expect(getByText('Retour au menu')).toBeTruthy();
        expect(getByText('Rejouer')).toBeTruthy();
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
});
