// frontend/src/__tests__/integration/vs-bot-game.integration.test.tsx
// Tests d'intégration : VsBotGameController + Board réel

import React from 'react';
import { act, fireEvent } from '@testing-library/react';
import VsBotGameController from '@/features/game/controllers/vs-bot-game.controller';
import {
    renderWithSocket,
    simulateGameStart,
    simulateGameEnd,
} from '../helpers/render.helper';

// Mock uniquement les sous-composants qui font .map() sur des données socket
jest.mock('@/features/game/components/board/grid/grid.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'grid' });
});
jest.mock('@/features/game/components/board/choices/choices.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'choices' });
});
jest.mock('@/features/game/components/board/dice/player-deck.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'player-deck' });
});
jest.mock('@/features/game/components/board/dice/opponent-deck.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'opponent-deck' });
});
jest.mock('@/features/game/components/board/dev/dev-panel.component', () => {
    const React = require('react');
    return () => React.createElement('View', { testID: 'dev-panel' });
});

describe('Intégration — VsBot Game (controller + board)', () => {

    it('flow complet : chargement → board monté → fin → rejouer', () => {
        const { getByText, queryByText, mockSocket } = renderWithSocket(
            <VsBotGameController />
        );

        // 1. Chargement
        expect(getByText(/Lancement/)).toBeTruthy();
        expect(mockSocket.emit).toHaveBeenCalledWith('game.vsbot');

        // 2. Board monté
        act(() => simulateGameStart(mockSocket));
        expect(queryByText(/Lancement/)).toBeNull();

        // 3. Fin de partie — victoire du joueur
        act(() => simulateGameEnd(mockSocket, {
            winner: 'player:1',
            reason: 'alignment5',
            player1Score: 7,
            player2Score: 3,
        }));
        expect(getByText(/Victoire/i)).toBeTruthy();

        // 4. Rejouer
        act(() => {
            fireEvent.click(getByText('Rejouer'));
        });
        const vsbotCalls = mockSocket.emit.mock.calls.filter(c => c[0] === 'game.vsbot');
        expect(vsbotCalls.length).toBe(2);
    });

    it('le Board réel est monté sans crash après game.start', () => {
        const { container, mockSocket } = renderWithSocket(
            <VsBotGameController />
        );

        act(() => simulateGameStart(mockSocket));

        // Le Board et ses sous-composants sont montés sans erreur
        expect(container.innerHTML).not.toContain('Lancement');
    });

    it('gère la victoire du bot', () => {
        const { getByText, mockSocket } = renderWithSocket(
            <VsBotGameController />
        );

        act(() => simulateGameStart(mockSocket));
        act(() => simulateGameEnd(mockSocket, {
            winner: 'player:2',
            reason: 'noTokens',
            player1Score: 2,
            player2Score: 5,
        }));

        expect(getByText(/Défaite/i)).toBeTruthy();
        expect(getByText(/Plus de pions disponibles/)).toBeTruthy();
    });

    it('le bouton "Retour au menu" appelle navigation.navigate', () => {
        const mockNavigate = jest.fn();
        const { getByText, mockSocket } = renderWithSocket(
            <VsBotGameController navigation={{ navigate: mockNavigate }} />
        );

        act(() => simulateGameStart(mockSocket));
        act(() => simulateGameEnd(mockSocket));

        act(() => {
            fireEvent.click(getByText('Menu Principal'));
        });

        expect(mockNavigate).toHaveBeenCalledWith('HomeScreen');
    });

    it('nettoie les listeners socket au démontage', () => {
        const { unmount, mockSocket } = renderWithSocket(
            <VsBotGameController />
        );

        unmount();

        expect(mockSocket.off).toHaveBeenCalledWith('game.start', expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith('game.end', expect.any(Function));
    });
});
