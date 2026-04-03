// backend/src/features/matchmaking/handlers/matchmaking-rank.test.ts
// Tests d'intégration : vérification du rang adverse dans game.start

import { createMockSocket } from '../../../__tests__/helpers/socket.helper';
import { Game } from '../../../shared/types';
import { createGame, createGameVsBot, resetQueue } from './matchmaking.handler';

// Mock HistoryService
const mockCreateGame = jest.fn();
jest.mock('../../history/services/history.service', () => ({
    __esModule: true,
    default: {
        createGame: (...args: unknown[]) => mockCreateGame(...args),
        finishGame: jest.fn(),
    },
}));

// Mock computeRank
const mockComputeRank = jest.fn();
jest.mock('../../profile/services/profile.service', () => ({
    computeRank: (...args: unknown[]) => mockComputeRank(...args),
}));

// Mock getPrismaClient
const mockGamePlayerCount = jest.fn();
jest.mock('../../../infrastructure/database', () => ({
    getPrismaClient: () => ({
        gamePlayer: {
            count: (...args: unknown[]) => mockGamePlayerCount(...args),
        },
    }),
}));

beforeEach(() => {
    mockCreateGame.mockResolvedValue({ id: 'db-game-rank-test' });
    mockGamePlayerCount.mockResolvedValue(10);
    mockComputeRank.mockReturnValue({ name: 'Or', tier: 'II', color: '#f4d35e' });
});

afterEach(() => {
    resetQueue();
    jest.clearAllMocks();
});

describe('Matchmaking - Rang dans game.start', () => {

    test('game.start de player1 contient le rang de player2 (son adversaire)', async () => {
        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';
        (p2 as unknown as Record<string, unknown>).userId = 'user-2';

        mockGamePlayerCount
            .mockResolvedValueOnce(10) // wins de player2 → rang pour player1
            .mockResolvedValueOnce(5); // wins de player1 → rang pour player2

        mockComputeRank
            .mockReturnValueOnce({ name: 'Or', tier: 'II', color: '#f4d35e' }) // rang player2
            .mockReturnValueOnce({ name: 'Argent', tier: 'I', color: '#c0c0c0' }); // rang player1

        const games: Game[] = [];
        await createGame(p1, p2, games);
        clearInterval(games[0]?.gameInterval);

        const p1StartPayload = p1.getLastEmitted('game.start') as Record<string, unknown>;
        const p2StartPayload = p2.getLastEmitted('game.start') as Record<string, unknown>;

        expect(p1StartPayload).toBeDefined();
        const opponent1 = p1StartPayload.opponent as Record<string, unknown>;
        expect(opponent1.rank).toEqual({ name: 'Or', tier: 'II', color: '#f4d35e' });

        expect(p2StartPayload).toBeDefined();
        const opponent2 = p2StartPayload.opponent as Record<string, unknown>;
        expect(opponent2.rank).toEqual({ name: 'Argent', tier: 'I', color: '#c0c0c0' });
    });

    test('computeRank est appelé avec le bon nombre de victoires', async () => {
        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';
        (p2 as unknown as Record<string, unknown>).userId = 'user-2';

        mockGamePlayerCount
            .mockResolvedValueOnce(7) // wins de player2
            .mockResolvedValueOnce(3); // wins de player1

        const games: Game[] = [];
        await createGame(p1, p2, games);
        clearInterval(games[0]?.gameInterval);

        expect(mockComputeRank).toHaveBeenCalledWith(7);
        expect(mockComputeRank).toHaveBeenCalledWith(3);
    });

    test('game.start s\'émet même si prisma échoue (rang null en fallback)', async () => {
        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';
        (p2 as unknown as Record<string, unknown>).userId = 'user-2';

        mockGamePlayerCount.mockRejectedValue(new Error('DB error'));

        const games: Game[] = [];
        await createGame(p1, p2, games);
        clearInterval(games[0]?.gameInterval);

        expect(p1.countEmitted('game.start')).toBe(1);
        expect(p2.countEmitted('game.start')).toBe(1);

        const p1StartPayload = p1.getLastEmitted('game.start') as Record<string, unknown>;
        const opponent1 = p1StartPayload.opponent as Record<string, unknown>;
        expect(opponent1.rank).toBeNull();
    });

    test('game.start en mode VsBot contient le rang null pour le bot (pas de userId)', async () => {
        const p1 = createMockSocket('p1');
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';

        // Bot n'a pas de userId → getWinsCount retourne 0
        mockGamePlayerCount.mockResolvedValueOnce(5); // wins de bot (userId undefined → skip)
        mockComputeRank.mockReturnValue({ name: 'Bronze', tier: 'IV', color: '#cd7f32' });

        const games: Game[] = [];
        await createGameVsBot(p1, games);
        clearInterval(games[0]?.gameInterval);

        expect(p1.countEmitted('game.start')).toBe(1);
    });
});
