import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import PlayerDeck from './player-deck.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

jest.mock('./die.component', () => {
    const React = require('react');
    return function MockDice({ index, value, _locked, onPress }) {
        return React.createElement(
            'TouchableOpacity',
            { 'data-testid': `dice-${index}`, onClick: () => onPress(index) },
            React.createElement('Text', {}, value || '-')
        );
    };
});

describe('PlayerDeck', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    const mockDeckData = {
        displayPlayerDeck: true,
        displayOpponentDeck: false,
        displayRollButton: true,
        rollsCounter: 1,
        rollsMaximum: 3,
        canRoll: true,
        canLockDice: true,
        dices: [
            { id: 1, value: '3', locked: false },
            { id: 2, value: '5', locked: true },
            { id: 3, value: '1', locked: false },
            { id: 4, value: '6', locked: false },
            { id: 5, value: '2', locked: false },
        ],
    };

    it('affiche le deck après réception de l\'état', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerDeck />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.deck.view-state', mockDeckData);
        });

        expect(getByText('Lancer')).toBeTruthy();
        expect(getByText('1/3')).toBeTruthy();
        expect(getByText('Lancer les dés')).toBeTruthy();
    });

    it('émet game.dices.roll au clic sur Roll', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerDeck />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.deck.view-state', mockDeckData);
        });

        fireEvent.click(getByText('Lancer les dés'));
        expect(mockSocket.emit).toHaveBeenCalledWith('game.dices.roll');
    });

    it('émet game.dices.lock au clic sur un dé avec valeur', () => {
        const { getByTestId } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerDeck />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.deck.view-state', mockDeckData);
        });

        fireEvent.click(getByTestId('dice-0'));
        expect(mockSocket.emit).toHaveBeenCalledWith('game.dices.lock', 1);
    });

    it('n\'affiche rien si displayPlayerDeck est false', () => {
        const { queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerDeck />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.deck.view-state', {
                ...mockDeckData,
                displayPlayerDeck: false,
            });
        });

        expect(queryByText('Lancer les dés')).toBeNull();
    });

    it('cache le bouton Roll si displayRollButton est false', () => {
        const { queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <PlayerDeck />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.deck.view-state', {
                ...mockDeckData,
                displayRollButton: false,
            });
        });

        expect(queryByText('Lancer les dés')).toBeNull();
    });
});
