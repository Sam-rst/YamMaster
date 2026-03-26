// frontend/src/features/replay/screens/replay.screen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import ReplayScreen from './replay.screen';

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
        { type: 'roll', playerNumber: 1, timestamp: 1000, data: { dices: [{ id: 1, value: '3' }, { id: 2, value: '5' }], rollNumber: 1 } },
        { type: 'lock', playerNumber: 1, timestamp: 2000, data: { diceId: 1, locked: true } },
        { type: 'roll', playerNumber: 1, timestamp: 3000, data: { dices: [{ id: 1, value: '3' }, { id: 2, value: '2' }], rollNumber: 2 } },
        { type: 'choice', playerNumber: 1, timestamp: 4000, data: { choiceId: 'brelan3' } },
        { type: 'grid', playerNumber: 1, timestamp: 5000, data: { rowIndex: 0, cellIndex: 0 } },
    ],
    players: [
        { playerNumber: 1, user: { id: 'u1', username: 'alice' }, isBot: false, score: 3, result: 'WIN' },
        { playerNumber: 2, user: null, isBot: true, score: 1, result: 'LOSE' },
    ],
};

describe('ReplayScreen', () => {

    beforeEach(() => jest.clearAllMocks());

    test('affiche un chargement pendant le fetch', () => {
        mockGetGameWithTurns.mockResolvedValue(null);
        const { getByText } = render(
            <ReplayScreen navigation={navigation} route={{ params: { gameId: 'game-1' } }} />
        );
        expect(getByText(/chargement/i)).toBeTruthy();
    });

    test('affiche les contrôles de replay après le chargement', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayScreen navigation={navigation} route={{ params: { gameId: 'game-1' } }} />
        );

        await waitFor(() => {
            expect(getByText(/suivant/i)).toBeTruthy();
        });
    });

    test('affiche le compteur d\'étapes', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayScreen navigation={navigation} route={{ params: { gameId: 'game-1' } }} />
        );

        await waitFor(() => {
            expect(getByText(/0 \/ 5/)).toBeTruthy();
        });
    });

    test('avance au clic sur Suivant', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayScreen navigation={navigation} route={{ params: { gameId: 'game-1' } }} />
        );

        await waitFor(() => {
            expect(getByText(/suivant/i)).toBeTruthy();
        });

        act(() => {
            fireEvent.click(getByText(/suivant/i));
        });

        expect(getByText(/1 \/ 5/)).toBeTruthy();
    });

    test('affiche le type d\'action à chaque étape', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayScreen navigation={navigation} route={{ params: { gameId: 'game-1' } }} />
        );

        await waitFor(() => {
            expect(getByText(/suivant/i)).toBeTruthy();
        });

        act(() => {
            fireEvent.click(getByText(/suivant/i));
        });

        // Première action = roll
        expect(getByText(/lancer/i)).toBeTruthy();
    });

    test('affiche un message d\'erreur si la partie n\'existe pas', async () => {
        mockGetGameWithTurns.mockResolvedValue(null);
        const { getByText } = render(
            <ReplayScreen navigation={navigation} route={{ params: { gameId: 'inexistant' } }} />
        );

        await waitFor(() => {
            expect(getByText(/introuvable/i)).toBeTruthy();
        });
    });
});
