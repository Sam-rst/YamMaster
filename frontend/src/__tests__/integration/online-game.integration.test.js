// frontend/src/__tests__/integration/online-game.integration.test.js
// Tests d'intégration : OnlineGameController + Board réel
// Le Board est rendu sans mock — on vérifie que le controller gère correctement
// les transitions d'état et que le Board se monte sans crash

import React from 'react';
import { act } from '@testing-library/react';
import OnlineGameController from '@/features/game/controllers/online-game.controller';
import {
    renderWithSocket,
    simulateGameStart,
    simulateGameEnd,
    simulateQueueAdded,
} from '../helpers/render.helper';

// Mock uniquement les sous-composants qui font .map() sur des données socket
// Le Board lui-même est RÉEL — on teste l'intégration controller↔board
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

describe('Intégration — Online Game (controller + board)', () => {

    it('flow complet : attente → queue → board monté → fin de partie', () => {
        const { getByText, queryByText, mockSocket } = renderWithSocket(
            <OnlineGameController />
        );

        // 1. État initial : attente du serveur
        expect(getByText('Waiting for server datas...')).toBeTruthy();

        // 2. Queue
        act(() => simulateQueueAdded(mockSocket));
        expect(getByText('Waiting for another player...')).toBeTruthy();
        expect(queryByText('Waiting for server datas...')).toBeNull();

        // 3. Game start — le Board réel est monté (avec sous-composants légers)
        act(() => simulateGameStart(mockSocket));
        expect(queryByText('Waiting for another player...')).toBeNull();

        // 4. Fin de partie
        act(() => simulateGameEnd(mockSocket, {
            winner: 'player:1',
            reason: 'alignment5',
            player1Score: 5,
            player2Score: 2,
        }));
        expect(getByText('Fin de la partie')).toBeTruthy();
        expect(getByText(/player:1/)).toBeTruthy();
        expect(getByText(/Alignement de 5 pions/)).toBeTruthy();
    });

    it('le Board réel est monté sans crash après game.start', () => {
        const { container, mockSocket } = renderWithSocket(
            <OnlineGameController />
        );

        act(() => simulateGameStart(mockSocket));

        // Le Board et ses sous-composants sont montés sans erreur
        // Le container a plus d'enfants qu'au démarrage (Board rendu)
        expect(container.innerHTML).not.toContain('Waiting');
    });

    it('rejoint la queue → partie → fin → rejouer relance le cycle', () => {
        const { getByText, mockSocket } = renderWithSocket(
            <OnlineGameController />
        );

        // Cycle 1
        act(() => simulateGameStart(mockSocket));
        act(() => simulateGameEnd(mockSocket));
        expect(getByText('Fin de la partie')).toBeTruthy();

        // Rejouer
        const { fireEvent: fe } = require('@testing-library/react');
        act(() => {
            fe.click(getByText('Rejouer'));
        });

        // queue.join émis 2 fois (init + rejouer)
        const queueCalls = mockSocket.emit.mock.calls.filter(c => c[0] === 'queue.join');
        expect(queueCalls.length).toBe(2);

        // Retour à l'état d'attente
        expect(getByText('Waiting for server datas...')).toBeTruthy();
    });

    it('le bouton "Retour au menu" appelle navigation.navigate', () => {
        const mockNavigate = jest.fn();
        const { getByText, mockSocket } = renderWithSocket(
            <OnlineGameController navigation={{ navigate: mockNavigate }} />
        );

        act(() => simulateGameStart(mockSocket));
        act(() => simulateGameEnd(mockSocket));

        act(() => {
            const { fireEvent: fe } = require('@testing-library/react');
            fe.click(getByText('Retour au menu'));
        });

        expect(mockNavigate).toHaveBeenCalledWith('HomeScreen');
    });

    it('nettoie les listeners socket au démontage', () => {
        const { unmount, mockSocket } = renderWithSocket(
            <OnlineGameController />
        );

        unmount();

        expect(mockSocket.off).toHaveBeenCalledWith('queue.added', expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith('game.start', expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith('game.end', expect.any(Function));
    });
});
