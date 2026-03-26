// backend/src/features/matchmaking/handlers/matchmaking-save.test.ts
// Tests d'intégration : sauvegarde des parties en BDD via le moteur de jeu

import { createMockSocket } from '../../../__tests__/helpers/socket.helper';
import { Game } from '../../../shared/types';
import { createGame, createGameVsBot, resetQueue } from './matchmaking.handler';

// Mock HistoryService
const mockCreateGame = jest.fn();
const mockFinishGame = jest.fn();
jest.mock('../../history/services/history.service', () => ({
    __esModule: true,
    default: {
        createGame: (...args: unknown[]) => mockCreateGame(...args),
        finishGame: (...args: unknown[]) => mockFinishGame(...args),
    },
}));

afterEach(() => {
    resetQueue();
    jest.clearAllMocks();
});

describe('Matchmaking - Sauvegarde BDD', () => {

    test('createGame appelle HistoryService.createGame avec les userId des sockets', async () => {
        mockCreateGame.mockResolvedValue({ id: 'db-game-1' });

        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        // Simuler le userId dans le handshake query
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';
        (p2 as unknown as Record<string, unknown>).userId = 'user-2';

        const games: Game[] = [];
        createGame(p1, p2, games);

        // HistoryService.createGame devrait être appelé avec le nouveau format
        expect(mockCreateGame).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: 'ONLINE',
                players: expect.arrayContaining([
                    expect.objectContaining({ userId: 'user-1', playerNumber: 1, isBot: false }),
                    expect.objectContaining({ userId: 'user-2', playerNumber: 2, isBot: false }),
                ]),
            }),
        );
    });

    test('createGameVsBot appelle HistoryService.createGame en mode VS_BOT', async () => {
        mockCreateGame.mockResolvedValue({ id: 'db-game-2' });

        const p1 = createMockSocket('p1');
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';

        const games: Game[] = [];
        createGameVsBot(p1, games);

        expect(mockCreateGame).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: 'VS_BOT',
                players: expect.arrayContaining([
                    expect.objectContaining({ userId: 'user-1', playerNumber: 1, isBot: false }),
                    expect.objectContaining({ userId: null, playerNumber: 2, isBot: true }),
                ]),
            }),
        );
    });

    test('dbGameId est assigné à la partie après la sauvegarde', async () => {
        mockCreateGame.mockResolvedValue({ id: 'db-game-42' });

        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';
        (p2 as unknown as Record<string, unknown>).userId = 'user-2';

        const games: Game[] = [];
        await createGame(p1, p2, games);

        // Attendre que la promesse soit résolue
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(games[0].dbGameId).toBe('db-game-42');
    });

    test('dbGameId est assigné pour une partie VsBot', async () => {
        mockCreateGame.mockResolvedValue({ id: 'db-game-43' });

        const p1 = createMockSocket('p1');
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';

        const games: Game[] = [];
        await createGameVsBot(p1, games);

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(games[0].dbGameId).toBe('db-game-43');
    });

    test('ne crash pas si HistoryService.createGame échoue', async () => {
        mockCreateGame.mockRejectedValue(new Error('DB error'));

        const p1 = createMockSocket('p1');
        const p2 = createMockSocket('p2');
        (p1 as unknown as Record<string, unknown>).userId = 'user-1';
        (p2 as unknown as Record<string, unknown>).userId = 'user-2';

        const games: Game[] = [];

        // Ne doit pas crasher
        expect(() => createGame(p1, p2, games)).not.toThrow();
        expect(games.length).toBe(1); // La partie est quand même créée en mémoire
    });
});
