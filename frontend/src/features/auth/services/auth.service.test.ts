// frontend/src/features/auth/services/auth.service.test.ts
// Tests unitaires du service d'authentification frontend

import AuthService from './auth.service';

// Mock fetch
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

describe('AuthService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        test('retourne le user en cas de succès', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({
                    success: true,
                    user: { id: 'user-1', username: 'alice', createdAt: '2026-01-01' },
                    isNewUser: false,
                }),
            });

            const result = await AuthService.login('alice', 'secret');

            expect(result.success).toBe(true);
            expect(result.user?.username).toBe('alice');
            expect(result.isNewUser).toBe(false);
        });

        test('retourne isNewUser: true pour un nouvel utilisateur', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 201,
                json: () => Promise.resolve({
                    success: true,
                    user: { id: 'user-2', username: 'bob', createdAt: '2026-01-01' },
                    isNewUser: true,
                }),
            });

            const result = await AuthService.login('bob', 'secret');

            expect(result.success).toBe(true);
            expect(result.isNewUser).toBe(true);
        });

        test('retourne une erreur pour un mauvais mot de passe', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 401,
                json: () => Promise.resolve({
                    success: false,
                    error: 'Mot de passe incorrect',
                }),
            });

            const result = await AuthService.login('alice', 'wrong');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Mot de passe incorrect');
        });

        test('retourne une erreur en cas de problème réseau', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await AuthService.login('alice', 'secret');

            expect(result.success).toBe(false);
            expect(result.error).toContain('réseau');
        });

        test('appelle la bonne URL avec les bons paramètres', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, user: {}, isNewUser: false }),
            });

            await AuthService.login('alice', 'secret');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/login'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: 'alice', password: 'secret' }),
                }),
            );
        });
    });

    describe('checkUsername', () => {
        test('retourne exists: true pour un username existant', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ exists: true }),
            });

            const result = await AuthService.checkUsername('alice');
            expect(result.exists).toBe(true);
        });

        test('retourne exists: false pour un username inexistant', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ exists: false }),
            });

            const result = await AuthService.checkUsername('newplayer');
            expect(result.exists).toBe(false);
        });

        test('retourne exists: false en cas d\'erreur réseau', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await AuthService.checkUsername('alice');
            expect(result.exists).toBe(false);
        });

        test('appelle la bonne URL', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ exists: true }),
            });

            await AuthService.checkUsername('alice');
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/check/alice'));
        });
    });
});
