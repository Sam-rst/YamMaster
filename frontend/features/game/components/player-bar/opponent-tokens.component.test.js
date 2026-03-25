import React from 'react';
import { render, act } from '@testing-library/react';
import OpponentTokens from './opponent-tokens.component';
import { SocketContext } from '../../../../shared/contexts/socket.context';
import { createMockSocket } from '../../../../__mocks__/socket.mock';

describe('OpponentTokens', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('affiche 12 jetons par défaut', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OpponentTokens />
            </SocketContext.Provider>
        );
        expect(getByText(/12/)).toBeTruthy();
    });

    it('met à jour les jetons après game.score', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OpponentTokens />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.score', {
                playerScore: 0,
                opponentScore: 2,
                playerTokens: 10,
                opponentTokens: 7,
            });
        });

        expect(getByText(/7/)).toBeTruthy();
    });
});
