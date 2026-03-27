// frontend/src/features/replay/screens/replay.screen.test.tsx
// Test du thin wrapper — vérifie qu'il passe les props au controller

import React from 'react';
import { render, waitFor } from '@testing-library/react';
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
        { type: 'roll', playerNumber: 1, timestamp: 1000, data: { dices: [{ id: 1, value: '3' }], rollNumber: 1 } },
    ],
    players: [
        { playerNumber: 1, user: { id: 'u1', username: 'alice' }, isBot: false, score: 3, result: 'WIN' },
        { playerNumber: 2, user: null, isBot: true, score: 1, result: 'LOSE' },
    ],
};

describe('ReplayScreen', () => {

    beforeEach(() => jest.clearAllMocks());

    test('rend le controller avec le gameId', async () => {
        mockGetGameWithTurns.mockResolvedValue(mockGameData);
        const { getByText } = render(
            <ReplayScreen navigation={navigation} route={{ params: { gameId: 'game-1' } }} />
        );

        await waitFor(() => {
            expect(getByText(/replay/i)).toBeTruthy();
        });

        expect(mockGetGameWithTurns).toHaveBeenCalledWith('game-1');
    });

    test('affiche une erreur si la partie est introuvable', async () => {
        mockGetGameWithTurns.mockResolvedValue(null);
        const { getByText } = render(
            <ReplayScreen navigation={navigation} route={{ params: { gameId: 'inexistant' } }} />
        );

        await waitFor(() => {
            expect(getByText(/introuvable/i)).toBeTruthy();
        });
    });
});
