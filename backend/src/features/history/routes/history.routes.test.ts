// backend/src/features/history/routes/history.routes.test.ts
// Tests d'intégration des routes HTTP d'historique

import express from 'express';
import request from 'supertest';
import { historyRouter } from './history.routes';

const mockGetGamesByUserId = jest.fn();
const mockGetGameById = jest.fn();
jest.mock('../services/history.service', () => ({
    __esModule: true,
    default: {
        getGamesByUserId: (...args: unknown[]) => mockGetGamesByUserId(...args),
        getGameById: (...args: unknown[]) => mockGetGameById(...args),
    },
}));

const app = express();
app.use(express.json());
app.use('/history', historyRouter);

describe('History Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /history/user/:userId', () => {
        test('retourne 200 avec la liste des parties', async () => {
            mockGetGamesByUserId.mockResolvedValue([
                { id: 'game-1', mode: 'ONLINE', status: 'FINISHED', player1Score: 5, player2Score: 3 },
                { id: 'game-2', mode: 'VS_BOT', status: 'FINISHED', player1Score: 2, player2Score: 6 },
            ]);

            const response = await request(app).get('/history/user/user-1');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        test('retourne 200 avec un tableau vide si pas de parties', async () => {
            mockGetGamesByUserId.mockResolvedValue([]);

            const response = await request(app).get('/history/user/user-new');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('GET /history/game/:gameId', () => {
        test('retourne 200 avec le détail d\'une partie', async () => {
            mockGetGameById.mockResolvedValue({
                id: 'game-1',
                mode: 'ONLINE',
                player1: { username: 'alice' },
                player2: { username: 'bob' },
            });

            const response = await request(app).get('/history/game/game-1');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe('game-1');
        });

        test('retourne 404 pour une partie inexistante', async () => {
            mockGetGameById.mockResolvedValue(null);

            const response = await request(app).get('/history/game/inexistant');

            expect(response.status).toBe(404);
        });
    });
});
