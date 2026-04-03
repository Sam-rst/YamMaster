// backend/src/features/profile/routes/profile.routes.test.ts
// Tests d'intégration des routes REST profil

import express from 'express';
import request from 'supertest';
import { profileRouter } from './profile.routes';

const mockGetProfileStats = jest.fn();
const mockUpdateAvatar = jest.fn();

jest.mock('../services/profile.service', () => ({
    __esModule: true,
    default: {
        getProfileStats: (...args: unknown[]) => mockGetProfileStats(...args),
        updateAvatar: (...args: unknown[]) => mockUpdateAvatar(...args),
    },
}));

const app = express();
app.use(express.json());
app.use('/profile', profileRouter);

describe('Profile Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ================================================================
    // GET /profile/:userId
    // ================================================================

    describe('GET /profile/:userId', () => {

        test('retourne 200 avec les stats du profil', async () => {
            mockGetProfileStats.mockResolvedValue({
                userId: 'user-1',
                username: 'alice',
                avatar: '🎲',
                totalGames: 10,
                wins: 6,
                losses: 3,
                draws: 1,
                winRate: 60,
                onlineGames: 7,
                botGames: 3,
                bestWinStreak: 4,
                averageScore: 7.5,
                favoriteBotDifficulty: 'MEDIUM',
                rank: 'Bronze II',
            });

            const response = await request(app).get('/profile/user-1');

            expect(response.status).toBe(200);
            expect(response.body.userId).toBe('user-1');
            expect(response.body.username).toBe('alice');
            expect(response.body.wins).toBe(6);
            expect(response.body.rank).toBe('Bronze II');
        });

        test('retourne 404 pour un utilisateur inconnu', async () => {
            mockGetProfileStats.mockResolvedValue(null);

            const response = await request(app).get('/profile/unknown');

            expect(response.status).toBe(404);
            expect(response.body.error).toBeDefined();
        });

        test('retourne 500 en cas d\'erreur serveur', async () => {
            mockGetProfileStats.mockRejectedValue(new Error('DB down'));

            const response = await request(app).get('/profile/user-1');

            expect(response.status).toBe(500);
        });
    });

    // ================================================================
    // PUT /profile/:userId/avatar
    // ================================================================

    describe('PUT /profile/:userId/avatar', () => {

        test('retourne 200 après mise à jour réussie de l\'avatar', async () => {
            mockUpdateAvatar.mockResolvedValue({ id: 'user-1', username: 'alice', avatar: '👑' });

            const response = await request(app)
                .put('/profile/user-1/avatar')
                .send({ avatar: '👑' });

            expect(response.status).toBe(200);
            expect(response.body.avatar).toBe('👑');
        });

        test('retourne 400 pour un avatar invalide', async () => {
            mockUpdateAvatar.mockRejectedValue(new Error('Avatar invalide : "🐱"'));

            const response = await request(app)
                .put('/profile/user-1/avatar')
                .send({ avatar: '🐱' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        test('retourne 400 si le champ avatar est absent', async () => {
            const response = await request(app)
                .put('/profile/user-1/avatar')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        test('retourne 500 en cas d\'erreur serveur inattendue', async () => {
            mockUpdateAvatar.mockRejectedValue(new Error('DB down'));

            const response = await request(app)
                .put('/profile/user-1/avatar')
                .send({ avatar: '🎲' });

            expect(response.status).toBe(500);
        });
    });
});
