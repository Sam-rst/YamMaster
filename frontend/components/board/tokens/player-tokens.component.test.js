import React from 'react';
import { render, act } from '@testing-library/react';
import PlayerTokens from './player-tokens.component';
import { SocketContext } from '../../../contexts/socket.context';
import { createMockSocket } from '../../../__mocks__/socket.mock';

describe('PlayerTokens', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('affiche 12 jetons par défaut', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerTokens />
            </SocketContext.Provider>
        );
        expect(getByText(/12/)).toBeTruthy();
    });

    it('met à jour les jetons après game.score', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerTokens />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.score', {
                playerScore: 1,
                opponentScore: 0,
                playerTokens: 8,
                opponentTokens: 11,
            });
        });

        expect(getByText(/8/)).toBeTruthy();
    });
});
