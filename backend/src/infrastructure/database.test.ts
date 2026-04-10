// backend/src/infrastructure/database.test.ts

const mockDisconnect = jest.fn();

jest.mock('../generated/prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        $disconnect: mockDisconnect,
    })),
}));

jest.mock('@prisma/adapter-neon', () => ({
    PrismaNeon: jest.fn(),
}));

describe('database', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    test('getPrismaClient retourne un client Prisma', async () => {
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
        const { getPrismaClient } = await import('./database');
        const client = getPrismaClient();
        expect(client).toBeTruthy();
    });

    test('getPrismaClient lance une erreur si DATABASE_URL est absente', async () => {
        delete process.env.DATABASE_URL;
        const { getPrismaClient } = await import('./database');
        expect(() => getPrismaClient()).toThrow('DATABASE_URL non définie');
    });

    test('disconnectDatabase ferme la connexion', async () => {
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
        const { getPrismaClient, disconnectDatabase } = await import('./database');
        getPrismaClient();
        await disconnectDatabase();
        expect(mockDisconnect).toHaveBeenCalled();
    });
});
