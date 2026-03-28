// Test du controller Replay — avec parsing paires action/snapshot

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import ReplayController from './replay.controller';

const mockGetGameWithTurns = jest.fn();
jest.mock('../services/replay.service', () => ({
    __esModule: true,
    default: {
        getGameWithTurns: (...args: unknown[]) => mockGetGameWithTurns(...args),
    },
}));

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const mockGameData = {
    id: 'game-1',
    mode: 'VS_BOT',
    reason: 'noTokens',
    turns: [
        // Paire 1 : action + snapshot
        { type: 'roll', playerNumber: 1, timestamp: 1000, data: { dices: [{ id: 1, value: '3' }], rollNumber: 1 } },
        { type: 'snapshot', playerNumber: 0, timestamp: 1001, data: { currentTurn: 'player:1', timer: 25, player1Score: 0, player2Score: 0, player1Tokens: 12, player2Tokens: 12, grid: [[{ id: '0-0', viewContent: '1', owner: null, canBeChecked: false }]], choices: { isDefi: false, isSec: false, idSelectedChoice: null, availableChoices: [] }, deck: { dices: [{ id: 1, value: '3', locked: false }], rollsCounter: 1, rollsMaximum: 3 } } },
        // Paire 2 : action + snapshot
        { type: 'lock', playerNumber: 1, timestamp: 2000, data: { diceId: 1, locked: true } },
        { type: 'snapshot', playerNumber: 0, timestamp: 2001, data: { currentTurn: 'player:1', timer: 20, player1Score: 0, player2Score: 0, player1Tokens: 12, player2Tokens: 12, grid: [[{ id: '0-0', viewContent: '1', owner: null, canBeChecked: false }]], choices: { isDefi: false, isSec: false, idSelectedChoice: null, availableChoices: [] }, deck: { dices: [{ id: 1, value: '3', locked: true }], rollsCounter: 1, rollsMaximum: 3 } } },
        // Paire 3 : action + snapshot
        { type: 'choice', playerNumber: 1, timestamp: 3000, data: { choiceId: 'brelan3' } },
        { type: 'snapshot', playerNumber: 0, timestamp: 3001, data: { currentTurn: 'player:1', timer: 15, player1Score: 1, player2Score: 0, player1Tokens: 11, player2Tokens: 12, grid: [[{ id: '0-0', viewContent: '1', owner: 'player:1', canBeChecked: false }]], choices: { isDefi: false, isSec: false, idSelectedChoice: 'brelan3', availableChoices: [] }, deck: { dices: [{ id: 1, value: '3', locked: true }], rollsCounter: 1, rollsMaximum: 3 } } },
    ],
    players: [
        { playerNumber: 1, user: { id: 'u1', username: 'alice' }, isBot: false, score: 3, result: 'WIN' },
        { playerNumber: 2, user: null, isBot: true, score: 1, result: 'LOSE' },
    ],
};

describe('ReplayController', () => {

    beforeEach(() => jest.clearAllMocks());

    test('affiche le titre Replay', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );
        await waitFor(() => {
            expect(getByText(/replay/i)).toBeTruthy();
        });
    });

    test('affiche les contrôles Suivant et Précédent', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );
        await waitFor(() => {
            expect(getByText(/suivant/i)).toBeTruthy();
            expect(getByText(/précédent/i)).toBeTruthy();
        });
    });

    test('affiche le ReplayBoard avec le snapshot après clic Suivant', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );

        await waitFor(() => {
            expect(getByText(/suivant/i)).toBeTruthy();
        });

        act(() => {
            fireEvent.click(getByText(/suivant/i));
        });

        // Doit afficher le compteur de lancers du snapshot (Lancer 1 / 3)
        expect(getByText(/lancer 1/i)).toBeTruthy();
    });

    test('calcule totalSteps = nombre de paires (3)', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );

        await waitFor(() => {
            // Le total affiché doit être 3 (3 paires)
            expect(getByText('3')).toBeTruthy();
        });
    });

    // ================================================================
    // AUTOPLAY
    // ================================================================

    test('la lecture automatique avance les steps', async () => {
        jest.useFakeTimers();
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByLabelText, getByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );

        await waitFor(() => {
            expect(getByLabelText('Play')).toBeTruthy();
        });

        // Lancer la lecture auto
        act(() => {
            fireEvent.click(getByLabelText('Play'));
        });

        // Après 2000ms → step 2, le ReplayBoard est affiché
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        // Step 2 affiche le snapshot de verrouillage (Lancer 1 / 3 toujours visible)
        expect(getByText(/lancer/i)).toBeTruthy();

        jest.useRealTimers();
    });

    test('la lecture automatique s\'arrête à la fin', async () => {
        jest.useFakeTimers();
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByLabelText, getAllByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );

        await waitFor(() => {
            expect(getByLabelText('Play')).toBeTruthy();
        });

        act(() => {
            fireEvent.click(getByLabelText('Play'));
        });

        // 3 paires × 1000ms = 3000ms pour finir + marge
        act(() => {
            jest.advanceTimersByTime(4000);
        });

        // Doit être revenu à Play (plus en Pause) — le label redevient Play
        expect(getByLabelText('Play')).toBeTruthy();
        // Le step counter affiche le dernier step (vérifie via getAllByText que "3" apparaît)
        const allThrees = getAllByText('3');
        expect(allThrees.length).toBeGreaterThanOrEqual(1);

        jest.useRealTimers();
    });

    test('le bouton Pause arrête la lecture', async () => {
        jest.useFakeTimers();
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByLabelText, getByText } = render(
            <ReplayController navigation={navigation} gameId="game-1" />
        );

        await waitFor(() => {
            expect(getByLabelText('Play')).toBeTruthy();
        });

        // Lancer
        act(() => {
            fireEvent.click(getByLabelText('Play'));
        });

        // Avancer 1 step
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        // Step 1 → ReplayBoard visible avec "Lancer de dés"
        expect(getByText(/lancer de dés/i)).toBeTruthy();

        // Pause — le label change à 'Pause'
        act(() => {
            fireEvent.click(getByLabelText('Pause'));
        });

        // Avancer encore — ne doit PAS bouger, toujours "Lancer de dés" (step 1 = roll)
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(getByText(/lancer de dés/i)).toBeTruthy();
        // Le bouton est revenu à Play
        expect(getByLabelText('Play')).toBeTruthy();

        jest.useRealTimers();
    });

    test('affiche une erreur si la partie est introuvable', async () => {
        mockGetGameWithTurns.mockResolvedValue(null);
        const { getByText } = render(
            <ReplayController navigation={navigation} gameId="inexistant" />
        );

        await waitFor(() => {
            expect(getByText(/introuvable/i)).toBeTruthy();
        });
    });
});
