import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import Choices from './choices.component';
import { SocketContext } from '../../../contexts/socket.context';
import { createMockSocket } from '../../../__mocks__/socket.mock';

describe('Choices', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('affiche les choix disponibles après réception de l\'état', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Choices />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.choices.view-state', {
                displayChoices: true,
                canMakeChoice: true,
                idSelectedChoice: null,
                availableChoices: [
                    { id: 'brelan3', value: 'Brelan3' },
                    { id: 'full', value: 'Full' },
                ],
            });
        });

        expect(getByText('Brelan3')).toBeTruthy();
        expect(getByText('Full')).toBeTruthy();
    });

    it('émet game.choices.selected au clic sur un choix', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Choices />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.choices.view-state', {
                displayChoices: true,
                canMakeChoice: true,
                idSelectedChoice: null,
                availableChoices: [{ id: 'full', value: 'Full' }],
            });
        });

        fireEvent.click(getByText('Full'));
        expect(mockSocket.emit).toHaveBeenCalledWith('game.choices.selected', { choiceId: 'full' });
    });

    it('n\'affiche rien si displayChoices est false', () => {
        const { queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Choices />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.choices.view-state', {
                displayChoices: false,
                canMakeChoice: false,
                idSelectedChoice: null,
                availableChoices: [{ id: 'full', value: 'Full' }],
            });
        });

        expect(queryByText('Full')).toBeNull();
    });
});
