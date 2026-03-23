import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import VsBotGameScreen from './vs-bot-game.screen';
import { SocketContext } from '../contexts/socket.context';
import { createMockSocket } from '../__mocks__/socket.mock';

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

    it('affiche l\'interface VsBot quand le socket est connecté', () => {
        const mockSocket = createMockSocket();
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameScreen navigation={mockNavigation} />
            </SocketContext.Provider>
        );
        expect(getByText('VsBot Game Interface')).toBeTruthy();
    });

    it('navigue vers HomeScreen au clic sur "Revenir au menu"', () => {
        const mockSocket = createMockSocket();
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <VsBotGameScreen navigation={mockNavigation} />
            </SocketContext.Provider>
        );
        fireEvent.click(getByText('Revenir au menu'));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('HomeScreen');
    });
});
