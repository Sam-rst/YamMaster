// backend/src/features/profile/services/profile.service.test.ts
// Tests unitaires du service de profil — stats, rang, win streak, avatar

import ProfileService from './profile.service';

const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    gamePlayer: {
        findMany: jest.fn(),
    },
};

jest.mock('../../../infrastructure/database', () => ({
    getPrismaClient: () => mockPrisma,
}));

const buildPlayers = (results: Array<{ result: string; score: number; isBot: boolean; difficulty?: string | null; mode?: string }>) =>
    results.map((r, i) => ({
        id: `gp-${i}`,
        result: r.result,
        score: r.score,
        isBot: r.isBot,
        difficulty: r.difficulty ?? null,
        game: { mode: r.mode ?? 'ONLINE', createdAt: new Date() },
    }));

describe('ProfileService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ================================================================
    // getProfileStats
    // ================================================================

    describe('getProfileStats', () => {

        test('calcule les stats avec des résultats mixtes', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '🎲' });
            mockPrisma.gamePlayer.findMany.mockResolvedValue(buildPlayers([
                { result: 'WIN', score: 10, isBot: false, mode: 'ONLINE' },
                { result: 'WIN', score: 8, isBot: false, mode: 'ONLINE' },
                { result: 'LOSE', score: 3, isBot: false, mode: 'ONLINE' },
                { result: 'DRAW', score: 5, isBot: false, mode: 'ONLINE' },
            ]));

            const stats = await ProfileService.getProfileStats('user-1');

            expect(stats).not.toBeNull();
            expect(stats!.totalGames).toBe(4);
            expect(stats!.wins).toBe(2);
            expect(stats!.losses).toBe(1);
            expect(stats!.draws).toBe(1);
            expect(stats!.winRate).toBeCloseTo(50);
        });

        test('retourne null pour un utilisateur inconnu', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const stats = await ProfileService.getProfileStats('unknown-user');

            expect(stats).toBeNull();
        });

        test('attribue le rang Bronze pour 3 victoires', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '🎲' });
            mockPrisma.gamePlayer.findMany.mockResolvedValue(buildPlayers([
                { result: 'WIN', score: 10, isBot: false },
                { result: 'WIN', score: 8, isBot: false },
                { result: 'WIN', score: 6, isBot: false },
            ]));

            const stats = await ProfileService.getProfileStats('user-1');

            expect(stats!.rank).toContain('Bronze');
        });

        test('attribue le rang Or pour 20 victoires', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '🎲' });
            const wins = Array.from({ length: 20 }, () => ({ result: 'WIN', score: 10, isBot: false }));
            mockPrisma.gamePlayer.findMany.mockResolvedValue(buildPlayers(wins));

            const stats = await ProfileService.getProfileStats('user-1');

            expect(stats!.rank).toContain('Or');
        });

        test('calcule la meilleure série de victoires consécutives', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '🎲' });
            mockPrisma.gamePlayer.findMany.mockResolvedValue(buildPlayers([
                { result: 'WIN', score: 10, isBot: false },
                { result: 'WIN', score: 8, isBot: false },
                { result: 'LOSE', score: 3, isBot: false },
                { result: 'WIN', score: 9, isBot: false },
                { result: 'WIN', score: 7, isBot: false },
                { result: 'WIN', score: 6, isBot: false },
            ]));

            const stats = await ProfileService.getProfileStats('user-1');

            expect(stats!.bestWinStreak).toBe(3);
        });

        test('calcule la moyenne des scores', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '🎲' });
            mockPrisma.gamePlayer.findMany.mockResolvedValue(buildPlayers([
                { result: 'WIN', score: 10, isBot: false },
                { result: 'LOSE', score: 6, isBot: false },
            ]));

            const stats = await ProfileService.getProfileStats('user-1');

            expect(stats!.averageScore).toBeCloseTo(8);
        });

        test('distingue les parties en ligne et vs bot', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '🎲' });
            mockPrisma.gamePlayer.findMany.mockResolvedValue(buildPlayers([
                { result: 'WIN', score: 10, isBot: false, mode: 'ONLINE' },
                { result: 'WIN', score: 8, isBot: false, mode: 'ONLINE' },
                { result: 'LOSE', score: 3, isBot: false, mode: 'VS_BOT' },
            ]));

            const stats = await ProfileService.getProfileStats('user-1');

            expect(stats!.onlineGames).toBe(2);
            expect(stats!.botGames).toBe(1);
        });

        test('calcule la difficulté bot favorite', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '🎲' });
            mockPrisma.gamePlayer.findMany.mockResolvedValue(buildPlayers([
                { result: 'WIN', score: 10, isBot: false, mode: 'VS_BOT', difficulty: 'EASY' },
                { result: 'WIN', score: 8, isBot: false, mode: 'VS_BOT', difficulty: 'HARD' },
                { result: 'LOSE', score: 3, isBot: false, mode: 'VS_BOT', difficulty: 'HARD' },
            ]));

            const stats = await ProfileService.getProfileStats('user-1');

            expect(stats!.favoriteBotDifficulty).toBe('HARD');
        });

        test('retourne 0 parties et stats vides pour un joueur sans parties', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '🎲' });
            mockPrisma.gamePlayer.findMany.mockResolvedValue([]);

            const stats = await ProfileService.getProfileStats('user-1');

            expect(stats!.totalGames).toBe(0);
            expect(stats!.wins).toBe(0);
            expect(stats!.winRate).toBe(0);
            expect(stats!.averageScore).toBe(0);
            expect(stats!.bestWinStreak).toBe(0);
        });
    });

    // ================================================================
    // updateAvatar
    // ================================================================

    describe('updateAvatar', () => {

        test('met à jour l\'avatar avec un emoji valide', async () => {
            mockPrisma.user.update.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '👑' });

            const result = await ProfileService.updateAvatar('user-1', '👑');

            expect(result).not.toBeNull();
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: { avatar: '👑' },
            });
        });

        test('rejette un emoji invalide', async () => {
            await expect(ProfileService.updateAvatar('user-1', '🐱')).rejects.toThrow();
            expect(mockPrisma.user.update).not.toHaveBeenCalled();
        });

        test('accepte tous les avatars de la liste autorisée', async () => {
            const validAvatars = ['🎲', '👑', '🎯', '⚡', '🔥', '🏆', '💎', '🐉'];
            for (const avatar of validAvatars) {
                mockPrisma.user.update.mockResolvedValue({ id: 'user-1', avatar });
                await expect(ProfileService.updateAvatar('user-1', avatar)).resolves.not.toBeNull();
            }
        });
    });
});
