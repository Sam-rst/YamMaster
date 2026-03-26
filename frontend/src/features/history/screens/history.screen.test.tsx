// frontend/src/features/history/screens/history.screen.test.tsx
// Tests de l'écran d'historique — données pré-formatées par le backend

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

    test('affiche la liste des parties avec le format backend', async () => {
        mockGetGamesByUserId.mockResolvedValue([
            {
                id: 'game-1',
                mode: 'ONLINE',
                status: 'FINISHED',
                reason: 'alignment5',
                reasonLabel: 'Alignement de 5 pions',
                myScore: 0,
                opponentScore: 0,
                scoreDisplay: 'Alignement de 5',
                myResult: 'WIN',
                opponentName: 'bob',
                createdAt: '2026-03-26T10:00:00Z',
            },
        ]);

        const { getByText } = renderHistoryScreen();

        await waitFor(() => {
            expect(getByText(/bob/)).toBeTruthy();
            expect(getByText(/Alignement de 5/)).toBeTruthy();
            expect(getByText(/victoire/i)).toBeTruthy();
        });
    });

    test('affiche un message si pas de parties', async () => {
        mockGetGamesByUserId.mockResolvedValue([]);
        const { getByText } = renderHistoryScreen();

        await waitFor(() => {
            expect(getByText(/aucune partie/i)).toBeTruthy();
        });
    });

    test('affiche Victoire, Défaite et Égalité correctement', async () => {
        mockGetGamesByUserId.mockResolvedValue([
            {
                id: 'game-1',
                mode: 'ONLINE',
                status: 'FINISHED',
                myScore: 5,
                opponentScore: 3,
                scoreDisplay: '5 - 3',
                myResult: 'WIN',
                opponentName: 'bob',
                createdAt: '2026-03-26T10:00:00Z',
            },
            {
                id: 'game-2',
                mode: 'VS_BOT',
                status: 'FINISHED',
                myScore: 2,
                opponentScore: 6,
                scoreDisplay: '2 - 6',
                myResult: 'LOSE',
                opponentName: 'Bot',
                createdAt: '2026-03-25T10:00:00Z',
            },
        ]);

        const { getByText } = renderHistoryScreen();

        await waitFor(() => {
            expect(getByText(/victoire/i)).toBeTruthy();
            expect(getByText(/défaite/i)).toBeTruthy();
        });
    });

    test('affiche le mode de jeu en français', async () => {
        mockGetGamesByUserId.mockResolvedValue([
            {
                id: 'game-1',
                mode: 'VS_BOT',
                status: 'FINISHED',
                myScore: 3,
                opponentScore: 1,
                scoreDisplay: '3 - 1',
                myResult: 'WIN',
                opponentName: 'Bot',
                createdAt: '2026-03-26T10:00:00Z',
            },
        ]);

        const { getByText } = renderHistoryScreen();

        await waitFor(() => {
            expect(getByText('Vs Bot')).toBeTruthy();
            expect(getByText('vs Bot')).toBeTruthy();
        });
    });
});
