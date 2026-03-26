// backend/src/features/auth/routes/auth.routes.test.ts
// Tests d'intégration des routes HTTP d'authentification

import express from 'express';
import request from 'supertest';
import { authRouter } from './auth.routes';

// Mock AuthService
const mockLoginOrRegister = jest.fn();
jest.mock('../services/auth.service', () => ({
    __esModule: true,
    default: {
        loginOrRegister: (...args: unknown[]) => mockLoginOrRegister(...args),
    },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/login', () => {
        test('retourne 200 avec un utilisateur pour un login réussi', async () => {
            mockLoginOrRegister.mockResolvedValue({
                success: true,
                user: { id: 'user-1', username: 'alice', createdAt: new Date() },
                isNewUser: false,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ username: 'alice', password: 'secret' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.username).toBe('alice');
            expect(response.body.isNewUser).toBe(false);
        });

        test('retourne 201 pour un nouvel utilisateur créé', async () => {
            mockLoginOrRegister.mockResolvedValue({
                success: true,
                user: { id: 'user-1', username: 'bob', createdAt: new Date() },
                isNewUser: true,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ username: 'bob', password: 'secret' });

            expect(response.status).toBe(201);
            expect(response.body.isNewUser).toBe(true);
        });

        test('retourne 401 pour un mauvais mot de passe', async () => {
            mockLoginOrRegister.mockResolvedValue({
                success: false,
                error: 'Mot de passe incorrect',
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ username: 'alice', password: 'wrong' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Mot de passe incorrect');
        });

        test('retourne 400 si username manquant', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ password: 'secret' });

            expect(response.status).toBe(400);
        });

        test('retourne 400 si password manquant', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ username: 'alice' });

            expect(response.status).toBe(400);
        });
    });
});
