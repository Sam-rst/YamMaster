// backend/src/features/auth/services/auth.service.test.ts
// Tests unitaires du service d'authentification

import AuthService from './auth.service';

// Mock Prisma
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
};

jest.mock('../../../infrastructure/database', () => ({
    getPrismaClient: () => mockPrisma,
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    compare: jest.fn((password: string, hash: string) => Promise.resolve(hash === `hashed_${password}`)),
}));

describe('AuthService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ================================================================
    // LOGIN OU REGISTER
    // ================================================================

    describe('loginOrRegister', () => {
        test('crée un nouvel utilisateur si username n\'existe pas', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: 'user-1',
                username: 'alice',
                password: 'hashed_secret',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await AuthService.loginOrRegister('alice', 'secret');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'alice' } });
            expect(mockPrisma.user.create).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.user?.username).toBe('alice');
            expect(result.isNewUser).toBe(true);
        });

        test('connecte un utilisateur existant avec le bon mot de passe', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                username: 'alice',
                password: 'hashed_secret',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await AuthService.loginOrRegister('alice', 'secret');

            expect(result.success).toBe(true);
            expect(result.user?.username).toBe('alice');
            expect(result.isNewUser).toBe(false);
        });

        test('refuse la connexion avec un mauvais mot de passe', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                username: 'alice',
                password: 'hashed_secret',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await AuthService.loginOrRegister('alice', 'wrong');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('refuse un username vide', async () => {
            const result = await AuthService.loginOrRegister('', 'secret');
            expect(result.success).toBe(false);
            expect(result.error).toContain('username');
        });

        test('refuse un mot de passe vide', async () => {
            const result = await AuthService.loginOrRegister('alice', '');
            expect(result.success).toBe(false);
            expect(result.error).toContain('mot de passe');
        });
    });

    // ================================================================
    // CHECK USERNAME
    // ================================================================

    describe('checkUsername', () => {
        test('retourne exists: true si l\'utilisateur existe', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', username: 'alice' });

            const result = await AuthService.checkUsername('alice');
            expect(result.exists).toBe(true);
        });

        test('retourne exists: false si l\'utilisateur n\'existe pas', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await AuthService.checkUsername('newplayer');
            expect(result.exists).toBe(false);
        });
    });

    // ================================================================
    // GET USER BY ID
    // ================================================================

    describe('getUserById', () => {
        test('retourne un utilisateur existant', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                username: 'alice',
                createdAt: new Date(),
            });

            const user = await AuthService.getUserById('user-1');
            expect(user).toBeDefined();
            expect(user?.username).toBe('alice');
        });

        test('retourne null pour un id inexistant', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const user = await AuthService.getUserById('inexistant');
            expect(user).toBeNull();
        });
    });

    // ================================================================
    // SANITIZE USER (ne pas exposer le mot de passe)
    // ================================================================

    describe('sanitizeUser', () => {
        test('retourne l\'utilisateur sans le mot de passe', () => {
            const user = {
                id: 'user-1',
                username: 'alice',
                password: 'hashed_secret',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const sanitized = AuthService.sanitizeUser(user);
            expect(sanitized.username).toBe('alice');
            expect(sanitized).not.toHaveProperty('password');
        });
    });
});
