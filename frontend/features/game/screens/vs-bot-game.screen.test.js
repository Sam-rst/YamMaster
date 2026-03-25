import React from 'react';
import { render } from '@testing-library/react';
import VsBotGameScreen from './vs-bot-game.screen';
import { SocketContext } from '../../../shared/contexts/socket.context';
import { createMockSocket } from '../../../__mocks__/socket.mock';

jest.mock('../controllers/vs-bot-game.controller', () => {
    const React = require('react');
    return function MockVsBotGameController() {
        return React.createElement('Text', {}, 'MockVsBotController');
    };
});

describe('VsBotGameScreen', () => {

    const mockNavigation = { navigate: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('affiche un message d\'erreur quand il n\'y a pas de socket', () => {
        const { getByText } = render(
            <SocketContext.Provider value={null}>
                <VsBotGameScreen navigation={mockNavigation} />
            </SocketContext.Provider>
        );
        expect(getByText('No connection with server...')).toBeTruthy();
    });

    it('affiche le controller quand le socket est connecté', () => {
        const mockSocket = createMockSocket();
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameScreen navigation={mockNavigation} />
            </SocketContext.Provider>
        );
        expect(getByText('MockVsBotController')).toBeTruthy();
    });
});
