import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import Choices from './choices.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

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
                isDefi: false,
                rollsCounter: 1,
                hasYam: false,
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
                isDefi: false,
                rollsCounter: 2,
                hasYam: false,
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
                isDefi: false,
                rollsCounter: 1,
                hasYam: false,
            });
        });

        expect(queryByText('Full')).toBeNull();
    });

    // --- Défi ---
    it('affiche le bouton Défi après le 1er lancer si canMakeChoice', () => {
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
                availableChoices: [],
                isDefi: false,
                rollsCounter: 2,
                hasYam: false,
            });
        });

        expect(getByText('Défi !')).toBeTruthy();
    });

    it('n\'affiche pas le bouton Défi avant le 1er lancer', () => {
        const { queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Choices />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.choices.view-state', {
                displayChoices: true,
                canMakeChoice: true,
                idSelectedChoice: null,
                availableChoices: [],
                isDefi: false,
                rollsCounter: 1,
                hasYam: false,
            });
        });

        expect(queryByText('Défi !')).toBeNull();
    });

    it('émet game.defi au clic sur le bouton Défi', () => {
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
                availableChoices: [],
                isDefi: false,
                rollsCounter: 2,
                hasYam: false,
            });
        });

        fireEvent.click(getByText('Défi !'));
        expect(mockSocket.emit).toHaveBeenCalledWith('game.defi');
    });

    it('affiche "Défi actif" quand isDefi est true', () => {
        const { getByText, queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Choices />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.choices.view-state', {
                displayChoices: true,
                canMakeChoice: true,
                idSelectedChoice: null,
                availableChoices: [{ id: 'defi', value: 'Défi' }],
                isDefi: true,
                rollsCounter: 2,
                hasYam: false,
            });
        });

        expect(getByText('Défi actif')).toBeTruthy();
        expect(queryByText('Défi !')).toBeNull(); // Le bouton disparaît
    });

    // --- Yam Predator ---
    it('affiche le bouton Yam Predator quand hasYam est true', () => {
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
                availableChoices: [{ id: 'yam', value: 'Yam' }],
                isDefi: false,
                rollsCounter: 3,
                hasYam: true,
            });
        });

        expect(getByText('Yam Predator')).toBeTruthy();
    });

    it('émet game.yamPredator.activate au clic sur Yam Predator', () => {
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
                availableChoices: [{ id: 'yam', value: 'Yam' }],
                isDefi: false,
                rollsCounter: 3,
                hasYam: true,
            });
        });

        fireEvent.click(getByText('Yam Predator'));
        expect(mockSocket.emit).toHaveBeenCalledWith('game.yamPredator.activate');
    });
});
