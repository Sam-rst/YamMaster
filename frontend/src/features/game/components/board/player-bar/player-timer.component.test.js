import React from 'react';
import { render, act } from '@testing-library/react';
import PlayerTimer from './player-timer.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

describe('PlayerTimer', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('affiche le timer à 0 initialement', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerTimer />
            </SocketContext.Provider>
        );
        expect(getByText('Timer: 0')).toBeTruthy();
    });

    it('met à jour le timer après réception de game.timer', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerTimer />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.timer', { playerTimer: 25, opponentTimer: 0 });
        });

        expect(getByText('Timer: 25')).toBeTruthy();
    });
});
