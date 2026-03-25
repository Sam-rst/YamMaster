import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import Grid from './grid.component';
import { SocketContext } from '@/shared/contexts/socket.context';
import { createMockSocket } from '@/__mocks__/socket.mock';

describe('Grid', () => {

    let mockSocket;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSocket = createMockSocket();
    });

    const mockGrid = [
        [
            { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
            { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: true },
        ],
        [
            { viewContent: '2', id: 'brelan2', owner: 'player:1', canBeChecked: false },
            { viewContent: 'Carré', id: 'carre', owner: 'player:2', canBeChecked: false },
        ],
    ];

    it('affiche les cellules de la grille après réception de l\'état', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Grid />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.grid.view-state', {
                displayGrid: true,
                canSelectCells: true,
                grid: mockGrid,
            });
        });

        expect(getByText('1')).toBeTruthy();
        expect(getByText('3')).toBeTruthy();
        expect(getByText('2')).toBeTruthy();
        expect(getByText('Carré')).toBeTruthy();
    });

    it('émet game.grid.selected au clic sur une cellule activable', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Grid />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.grid.view-state', {
                displayGrid: true,
                canSelectCells: true,
                grid: mockGrid,
            });
        });

        fireEvent.click(getByText('3')); // canBeChecked: true
        expect(mockSocket.emit).toHaveBeenCalledWith('game.grid.selected', {
            cellId: 'brelan3',
            rowIndex: 0,
            cellIndex: 1,
        });
    });

    it('écoute l\'événement game.grid.view-state', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <Grid />
            </SocketContext.Provider>
        );
        const events = mockSocket.on.mock.calls.map(call => call[0]);
        expect(events).toContain('game.grid.view-state');
    });

    // --- Yam Predator ---
    it('affiche la bannière Yam Predator quand le mode est activé', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Grid />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.grid.view-state', {
                displayGrid: true,
                canSelectCells: true,
                grid: mockGrid,
            });
        });

        act(() => {
            mockSocket.__simulateEvent('game.yamPredator.activate');
        });

        expect(getByText(/Yam Predator/)).toBeTruthy();
    });

    it('émet game.grid.yamPredator au clic sur un pion adverse en mode predator', () => {
        const { getByText } = render(
            <SocketContext.Provider value={mockSocket}>
                <Grid />
            </SocketContext.Provider>
        );

        act(() => {
            mockSocket.__simulateEvent('game.grid.view-state', {
                displayGrid: true,
                canSelectCells: true,
                grid: mockGrid,
            });
        });

        act(() => {
            mockSocket.__simulateEvent('game.yamPredator.activate');
        });

        // Cliquer sur la cellule "Carré" qui est owner: 'player:2'
        fireEvent.click(getByText('Carré'));
        expect(mockSocket.emit).toHaveBeenCalledWith('game.grid.yamPredator', {
            rowIndex: 1,
            cellIndex: 1,
        });
    });
});
