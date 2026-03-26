import React from 'react';
import { render, act } from '@testing-library/react';
import OpponentDeck from './opponent-deck.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

jest.mock('./die.component', () => {
    const React = require('react');
    return function MockDice({ value, _locked, _opponent }) {
        return React.createElement('Text', {}, `Dice:${value || '-'}`);
    };
});

describe('OpponentDeck', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('n\'affiche rien si displayOpponentDeck est false', () => {
        const { queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OpponentDeck />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.deck.view-state', {
                displayOpponentDeck: false,
                displayPlayerDeck: true,
                dices: [],
            });
        });

        expect(queryByText(/Dice:/)).toBeNull();
    });

    it('affiche les dés de l\'adversaire quand displayOpponentDeck est true', () => {
        const { getAllByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <OpponentDeck />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.deck.view-state', {
                displayOpponentDeck: true,
                displayPlayerDeck: false,
                dices: [
                    { id: 1, value: '3', locked: false },
                    { id: 2, value: '5', locked: true },
                    { id: 3, value: '1', locked: false },
                    { id: 4, value: '6', locked: false },
                    { id: 5, value: '2', locked: false },
                ],
            });
        });

        expect(getAllByText(/Dice:/).length).toBe(5);
    });
});
