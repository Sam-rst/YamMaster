// frontend/src/features/profile/services/profile.service.test.ts
// Tests unitaires du ProfileService frontend

import ProfileService from './profile.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockProfileStats = {
    userId: 'user-1',
    username: 'alice',
    avatar: '🎲',
    createdAt: '2026-01-01T00:00:00.000Z',
    rank: {
        name: 'Or',
        tier: 'GOLD',
        color: '#f4d35e',
    },
    stats: {
        totalGames: 42,
        wins: 25,
        losses: 15,
        draws: 2,
        winRate: 59.5,
        onlineGames: 30,
        botGames: 12,
        bestWinStreak: 7,
        averageScore: 4.2,
        favoriteBotDifficulty: 'MEDIUM',
    },
};

describe('ProfileService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProfile', () => {
        test('retourne les stats du profil pour un userId valide', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockProfileStats),
            });

            const profile = await ProfileService.getProfile('user-1');

            expect(profile).toBeDefined();
            expect(profile?.userId).toBe('user-1');
            expect(profile?.username).toBe('alice');
            expect(profile?.rank.tier).toBe('GOLD');
            expect(profile?.stats.totalGames).toBe(42);
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/profile/user-1'));
        });

        test('retourne null si le profil est introuvable (404)', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Profil non trouvé' }),
            });

            const profile = await ProfileService.getProfile('unknown-user');

            expect(profile).toBeNull();
        });

        test('retourne null en cas d\'erreur réseau', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const profile = await ProfileService.getProfile('user-1');

            expect(profile).toBeNull();
        });
    });

    describe('updateAvatar', () => {
        test('envoie une requête PUT avec le nouvel avatar', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            await ProfileService.updateAvatar('user-1', '👑');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/profile/user-1/avatar'),
                expect.objectContaining({
                    method: 'PUT',
                    headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({ avatar: '👑' }),
                }),
            );
        });

        test('retourne true en cas de succès', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            const result = await ProfileService.updateAvatar('user-1', '🏆');

            expect(result).toBe(true);
        });

        test('retourne false en cas d\'erreur réseau', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await ProfileService.updateAvatar('user-1', '🎯');

            expect(result).toBe(false);
        });
    });
});
