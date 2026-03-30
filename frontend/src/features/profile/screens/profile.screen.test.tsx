// frontend/src/features/profile/screens/profile.screen.test.tsx
// Tests TDD de l'écran ProfileScreen

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import ProfileScreen from './profile.screen';

// Mock ProfileService
const mockGetProfile = jest.fn();
const mockUpdateAvatar = jest.fn();
jest.mock('../services/profile.service', () => ({
    __esModule: true,
    default: {
        getProfile: (...args: unknown[]) => mockGetProfile(...args),
        updateAvatar: (...args: unknown[]) => mockUpdateAvatar(...args),
    },
}));

// Mock auth context
jest.mock('@/shared/contexts/auth.context', () => ({
    useAuth: () => ({
        user: { id: 'u1', username: 'alice', createdAt: '2024-03-14T00:00:00.000Z' },
        isAuthenticated: true,
    }),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    Feather: ({ name, ...props }: { name: string } & Record<string, unknown>) =>
        <span data-testid={`icon-${name}`} {...props} />,
}));

// Mock StatsGrid
jest.mock('../components/stats-grid/stats-grid.component', () => ({
    __esModule: true,
    default: ({ stats }: { stats: { totalGames: number; winRate: number } }) => (
        <div data-testid="stats-grid">
            <span data-testid="total-games">{stats.totalGames}</span>
            <span data-testid="win-rate">{stats.winRate}%</span>
        </div>
    ),
}));

// Mock AvatarPicker
jest.mock('../components/avatar-picker/avatar-picker.component', () => ({
    __esModule: true,
    default: ({ visible, onSelect, onClose }: { visible: boolean; currentAvatar: string; onSelect: (a: string) => void; onClose: () => void }) =>
        visible ? (
            <div data-testid="avatar-picker">
                <button onClick={() => onSelect('🎯')}>Choisir 🎯</button>
                <button onClick={onClose}>Fermer</button>
            </div>
        ) : null,
}));

const mockProfile = {
    userId: 'u1',
    username: 'alice',
    avatar: '🎲',
    createdAt: '2024-03-14T00:00:00.000Z',
    rank: { name: 'Bronze', tier: 'BRONZE', color: '#cd7f32' },
    stats: {
        totalGames: 42,
        wins: 20,
        losses: 18,
        draws: 4,
        winRate: 48,
        onlineGames: 30,
        botGames: 12,
        bestWinStreak: 5,
        averageScore: 210,
        favoriteBotDifficulty: 'EASY',
    },
};

describe('ProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('affiche un loader puis le nom d\'utilisateur et l\'avatar après chargement', async () => {
        mockGetProfile.mockResolvedValue(mockProfile);

        const { getByTestId, getByText, queryByTestId } = render(<ProfileScreen />);

        // Pendant le chargement, le loader est visible
        expect(getByTestId('profile-loader')).toBeTruthy();

        // Après le chargement
        await waitFor(() => {
            expect(queryByTestId('profile-loader')).toBeNull();
        });

        expect(getByText('ALICE')).toBeTruthy();
        expect(getByText('🎲')).toBeTruthy();
    });

    test('affiche les statistiques (totalGames, winRate%)', async () => {
        mockGetProfile.mockResolvedValue(mockProfile);

        const { getByTestId } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(getByTestId('stats-grid')).toBeTruthy();
        });

        expect(getByTestId('total-games').textContent).toBe('42');
        expect(getByTestId('win-rate').textContent).toBe('48%');
    });

    test('affiche "introuvable" si le profil est null', async () => {
        mockGetProfile.mockResolvedValue(null);

        const { getByText, queryByTestId } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(queryByTestId('profile-loader')).toBeNull();
        });

        expect(getByText(/introuvable/i)).toBeTruthy();
    });

    test('ouvre l\'AvatarPicker au clic sur l\'avatar', async () => {
        mockGetProfile.mockResolvedValue(mockProfile);

        const { getByTestId, queryByTestId } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(queryByTestId('profile-loader')).toBeNull();
        });

        expect(queryByTestId('avatar-picker')).toBeNull();

        fireEvent.click(getByTestId('avatar-button'));

        expect(getByTestId('avatar-picker')).toBeTruthy();
    });

    test('met à jour l\'avatar après sélection', async () => {
        mockGetProfile.mockResolvedValue(mockProfile);
        mockUpdateAvatar.mockResolvedValue(true);

        const { getByTestId, getByText, queryByTestId } = render(<ProfileScreen />);

        await waitFor(() => {
            expect(queryByTestId('profile-loader')).toBeNull();
        });

        fireEvent.click(getByTestId('avatar-button'));

        await act(async () => {
            fireEvent.click(getByText('Choisir 🎯'));
        });

        expect(mockUpdateAvatar).toHaveBeenCalledWith('u1', '🎯');
    });
});
