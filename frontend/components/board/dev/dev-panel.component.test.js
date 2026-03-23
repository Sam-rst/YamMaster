import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import DevPanel from './dev-panel.component';
import { SocketContext } from '../../../contexts/socket.context';
import { createMockSocket } from '../../../__mocks__/socket.mock';

describe('DevPanel', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    it('affiche un bouton DEV par défaut', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <DevPanel />
            </SocketContext.Provider>
        );
        expect(getByText('DEV')).toBeTruthy();
    });

    it('ouvre le panneau au clic sur DEV', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <DevPanel />
            </SocketContext.Provider>
        );
        fireEvent.click(getByText('DEV'));
        expect(getByText('Mode Dev')).toBeTruthy();
        expect(getByText('J1')).toBeTruthy();
        expect(getByText('J2')).toBeTruthy();
    });

    it('ferme le panneau au clic sur X', () => {
        const { getByText, queryByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <DevPanel />
            </SocketContext.Provider>
        );
        fireEvent.click(getByText('DEV'));
        expect(getByText('Mode Dev')).toBeTruthy();
        fireEvent.click(getByText('X'));
        expect(queryByText('Mode Dev')).toBeNull();
    });

    it('émet game.dev.place au clic sur une cellule de la grille', () => {
        const { getByText, getAllByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <DevPanel />
            </SocketContext.Provider>
        );

        // Ouvrir le panneau
        fireEvent.click(getByText('DEV'));

        // Simuler une grille
        act(() => {
            mockSocket.__simulateEvent('game.grid.view-state', {
                displayGrid: true,
                canSelectCells: false,
                grid: [
                    [
                        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
                        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
                    ],
                ],
            });
        });

        // Cliquer sur une cellule vide (affichée comme '.')
        const dots = getAllByText('.');
        fireEvent.click(dots[0]);
        expect(mockSocket.emit).toHaveBeenCalledWith('game.dev.place', {
            rowIndex: 0,
            cellIndex: 0,
            owner: 'player:1',
        });
    });

    it('permet de changer le joueur sélectionné', () => {
        const { getByText, getAllByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <DevPanel />
            </SocketContext.Provider>
        );

        fireEvent.click(getByText('DEV'));

        act(() => {
            mockSocket.__simulateEvent('game.grid.view-state', {
                displayGrid: true,
                canSelectCells: false,
                grid: [
                    [{ viewContent: '1', id: 'b1', owner: null, canBeChecked: false }],
                ],
            });
        });

        // Sélectionner J2
        fireEvent.click(getByText('J2'));
        fireEvent.click(getAllByText('.')[0]);

        expect(mockSocket.emit).toHaveBeenCalledWith('game.dev.place', {
            rowIndex: 0,
            cellIndex: 0,
            owner: 'player:2',
        });
    });
});
