import React from 'react';
import { render, act } from '@testing-library/react';
import PlayerScore from './player-score.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

describe('PlayerScore', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('affiche score 0 par défaut', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerScore />
            </SocketContext.Provider>
        );
        expect(getByText('Score')).toBeTruthy();
    });

    it('met à jour le score après game.score', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerScore />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.score', {
                playerScore: 3,
                opponentScore: 1,
                playerTokens: 8,
                opponentTokens: 10,
            });
        });

        expect(getByText('3')).toBeTruthy();
    });
});
