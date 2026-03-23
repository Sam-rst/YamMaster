import React from 'react';
import { render, act } from '@testing-library/react';
import OpponentTimer from './oppenent-timer.component';
import { SocketContext } from '../../../contexts/socket.context';
import { createMockSocket } from '../../../__mocks__/socket.mock';

describe('OpponentTimer', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('affiche le timer à 0 initialement', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OpponentTimer />
            </SocketContext.Provider>
        );
        expect(getByText('Timer: 0')).toBeTruthy();
    });

    it('met à jour le timer après réception de game.timer', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OpponentTimer />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.timer', { playerTimer: 0, opponentTimer: 18 });
        });

        expect(getByText('Timer: 18')).toBeTruthy();
    });
});
