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

    it('écoute les événements queue.added et game.start', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameController />
            </SocketContext.Provider>
        );
        const events = mockSocket.on.mock.calls.map(call => call[0]);
        expect(events).toContain('queue.added');
        expect(events).toContain('game.start');
    });
});
