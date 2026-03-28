import React from 'react';
import { render, act } from '@testing-library/react';
import OpponentScore from './opponent-score.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

describe('OpponentScore', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('affiche score 0 par défaut', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OpponentScore />
            </SocketContext.Provider>
        );
        expect(getByText('Score')).toBeTruthy();
    });

    it('met à jour le score après game.score', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OpponentScore />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.score', {
                playerScore: 1,
                opponentScore: 4,
                playerTokens: 10,
                opponentTokens: 7,
            });
        });

        expect(getByText('4')).toBeTruthy();
    });
});
