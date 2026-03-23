import React from 'react';
import { render } from '@testing-library/react';
import OnlineGameScreen from './online-game.screen';
import { SocketContext } from '../contexts/socket.context';
import { createMockSocket } from '../__mocks__/socket.mock';

jest.mock('../controllers/online-game.controller', () => {
    const React = require('react');
    return function MockOnlineGameController() {
        return React.createElement('Text', {}, 'MockController');
    };
});

describe('OnlineGameScreen', () => {

    const mockNavigation = { navigate: jest.fn() };

    it('affiche un message d\'erreur quand il n\'y a pas de socket', () => {
        const { getByText } = render(
            <SocketContext.Provider value={null}>
                <OnlineGameScreen navigation={mockNavigation} />
            </SocketContext.Provider>
        );
        expect(getByText('No connection with server...')).toBeTruthy();
    });

    it('affiche le controller quand le socket est connecté', () => {
        const mockSocket = createMockSocket();
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OnlineGameScreen navigation={mockNavigation} />
            </SocketContext.Provider>
        );
        expect(getByText('MockController')).toBeTruthy();
    });
});
