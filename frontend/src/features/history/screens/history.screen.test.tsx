// frontend/src/features/history/screens/history.screen.test.tsx
// Tests d'intégration de l'écran d'historique

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import HistoryScreen from './history.screen';
import { AuthContext } from '@/shared/contexts/auth.context';

const mockGetGamesByUserId = jest.fn();
jest.mock('../services/history.service', () => ({
    __esModule: true,
    default: {
        getGamesByUserId: (...args: unknown[]) => mockGetGamesByUserId(...args),
    },
}));

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const renderHistoryScreen = (user = { id: 'user-1', username: 'alice', createdAt: '2026-01-01' }) => {
    return render(
        <AuthContext.Provider value={{
            user,
            isAuthenticated: true,
            login: jest.fn(),
            logout: jest.fn(),
        }}>
            <HistoryScreen navigation={navigation} />
        </AuthContext.Provider>
    );
};

describe('HistoryScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('affiche un titre "Historique"', async () => {
        mockGetGamesByUserId.mockResolvedValue([]);
        const { getByText } = renderHistoryScreen();

        await waitFor(() => {
            expect(getByText(/historique/i)).toBeTruthy();
        });
    });

    test('appelle getGamesByUserId avec le userId connecté', async () => {
        mockGetGamesByUserId.mockResolvedValue([]);
        renderHistoryScreen();

        await waitFor(() => {
            expect(mockGetGamesByUserId).toHaveBeenCalledWith('user-1');
        });
    });

    test('affiche la liste des parties', async () => {
        mockGetGamesByUserId.mockResolvedValue([
            {
                id: 'game-1',
                mode: 'ONLINE',
                status: 'FINISHED',
                player1Score: 5,
                player2Score: 3,
                player1: { id: 'user-1', username: 'alice' },
                player2: { id: 'user-2', username: 'bob' },
                winner: { id: 'user-1', username: 'alice' },
                createdAt: '2026-03-26T10:00:00Z',
            },
        ]);

        const { getByText } = renderHistoryScreen();

        await waitFor(() => {
            expect(getByText(/bob/)).toBeTruthy();
            expect(getByText(/5.*3|3.*5/)).toBeTruthy();
        });
    });

    test('affiche un message si pas de parties', async () => {
        mockGetGamesByUserId.mockResolvedValue([]);
        const { getByText } = renderHistoryScreen();

        await waitFor(() => {
            expect(getByText(/aucune partie/i)).toBeTruthy();
        });
    });

    test('affiche "Victoire" ou "Défaite" selon le résultat', async () => {
        mockGetGamesByUserId.mockResolvedValue([
            {
                id: 'game-1',
                mode: 'ONLINE',
                status: 'FINISHED',
                player1Score: 5,
                player2Score: 3,
                player1: { id: 'user-1', username: 'alice' },
                player2: { id: 'user-2', username: 'bob' },
                winner: { id: 'user-1', username: 'alice' },
                createdAt: '2026-03-26T10:00:00Z',
            },
            {
                id: 'game-2',
                mode: 'VS_BOT',
                status: 'FINISHED',
                player1Score: 2,
                player2Score: 6,
                player1: { id: 'user-1', username: 'alice' },
                player2: null,
                winner: { id: 'user-bot', username: 'bot' },
                createdAt: '2026-03-25T10:00:00Z',
            },
        ]);

        const { getByText } = renderHistoryScreen();

        await waitFor(() => {
            expect(getByText(/victoire/i)).toBeTruthy();
            expect(getByText(/défaite/i)).toBeTruthy();
        });
    });
});
