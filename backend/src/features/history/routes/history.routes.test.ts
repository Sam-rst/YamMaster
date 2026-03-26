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
        test('retourne 200 avec la liste des parties formatées', async () => {
            mockGetGamesByUserId.mockResolvedValue([
                {
                    id: 'game-1', mode: 'ONLINE', status: 'FINISHED', reason: 'alignment5',
                    createdAt: new Date(), endedAt: new Date(),
                    players: [
                        { playerNumber: 1, userId: 'user-1', isBot: false, score: 5, tokensLeft: 7, result: 'WIN', user: { id: 'user-1', username: 'alice' } },
                        { playerNumber: 2, userId: 'user-2', isBot: false, score: 3, tokensLeft: 9, result: 'LOSE', user: { id: 'user-2', username: 'bob' } },
                    ],
                },
            ]);

            const response = await request(app).get('/history/user/user-1');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].myResult).toBe('WIN');
            expect(response.body[0].opponentName).toBe('bob');
            expect(response.body[0].myScore).toBe(5);
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
