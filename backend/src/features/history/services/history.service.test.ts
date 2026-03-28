// backend/src/features/history/services/history.service.test.ts
// Tests unitaires du service d'historique — schema GamePlayer

import HistoryService from './history.service';

const mockPrisma = {
    game: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    gamePlayer: {
        updateMany: jest.fn(),
    },
};

jest.mock('../../../infrastructure/database', () => ({
    getPrismaClient: () => mockPrisma,
}));

describe('HistoryService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ================================================================
    // CRÉER UNE PARTIE
    // ================================================================

    describe('createGame', () => {
        test('crée une partie ONLINE avec 2 joueurs via GamePlayer', async () => {
            mockPrisma.game.create.mockResolvedValue({
                id: 'game-1',
                mode: 'ONLINE',
                status: 'IN_PROGRESS',
                players: [
                    { playerNumber: 1, userId: 'user-1', isBot: false },
                    { playerNumber: 2, userId: 'user-2', isBot: false },
                ],
            });

            const result = await HistoryService.createGame({
                mode: 'ONLINE',
                players: [
                    { userId: 'user-1', playerNumber: 1, isBot: false },
                    { userId: 'user-2', playerNumber: 2, isBot: false },
                ],
            });

            expect(result).toBeDefined();
            expect(result.mode).toBe('ONLINE');
            expect(mockPrisma.game.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        mode: 'ONLINE',
                        players: expect.objectContaining({
                            create: expect.arrayContaining([
                                expect.objectContaining({ userId: 'user-1', playerNumber: 1 }),
                                expect.objectContaining({ userId: 'user-2', playerNumber: 2 }),
                            ]),
                        }),
                    }),
                }),
            );
        });

        test('crée une partie VS_BOT avec un bot (userId null)', async () => {
            mockPrisma.game.create.mockResolvedValue({
                id: 'game-2',
                mode: 'VS_BOT',
                players: [
                    { playerNumber: 1, userId: 'user-1', isBot: false },
                    { playerNumber: 2, userId: null, isBot: true },
                ],
            });

            const result = await HistoryService.createGame({
                mode: 'VS_BOT',
                players: [
                    { userId: 'user-1', playerNumber: 1, isBot: false },
                    { userId: null, playerNumber: 2, isBot: true },
                ],
            });

            expect(result).toBeDefined();
        });

        test('propage l\'erreur BDD', async () => {
            mockPrisma.game.create.mockRejectedValue(new Error('DB down'));

            await expect(HistoryService.createGame({
                mode: 'ONLINE',
                players: [
                    { userId: 'user-1', playerNumber: 1, isBot: false },
                ],
            })).rejects.toThrow('DB down');
        });
    });

    // ================================================================
    // TERMINER UNE PARTIE
    // ================================================================

    describe('finishGame', () => {
        test('met à jour le status et les résultats des joueurs', async () => {
            mockPrisma.game.update.mockResolvedValue({
                id: 'game-1',
                status: 'FINISHED',
                reason: 'alignment5',
            });
            mockPrisma.gamePlayer.updateMany.mockResolvedValue({ count: 1 });

            await HistoryService.finishGame('game-1', {
                reason: 'alignment5',
                playerResults: [
                    { playerNumber: 1, score: 5, tokensLeft: 7, result: 'WIN' },
                    { playerNumber: 2, score: 3, tokensLeft: 9, result: 'LOSE' },
                ],
            });

            expect(mockPrisma.game.update).toHaveBeenCalledWith({
                where: { id: 'game-1' },
                data: expect.objectContaining({
                    status: 'FINISHED',
                    reason: 'alignment5',
                    endedAt: expect.any(Date),
                }),
            });

            // Vérifie que chaque joueur est mis à jour
            expect(mockPrisma.gamePlayer.updateMany).toHaveBeenCalledTimes(2);
        });

        test('propage l\'erreur BDD', async () => {
            mockPrisma.game.update.mockRejectedValue(new Error('DB down'));

            await expect(HistoryService.finishGame('game-1', {
                reason: 'noTokens',
                playerResults: [],
            })).rejects.toThrow('DB down');
        });
    });

    // ================================================================
    // LISTER LES PARTIES D'UN JOUEUR
    // ================================================================

    describe('getGamesByUserId', () => {
        test('retourne les parties d\'un joueur avec les participants', async () => {
            mockPrisma.game.findMany.mockResolvedValue([
                {
                    id: 'game-1',
                    mode: 'ONLINE',
                    status: 'FINISHED',
                    players: [
                        { playerNumber: 1, userId: 'user-1', score: 5, result: 'WIN', isBot: false, user: { username: 'alice' } },
                        { playerNumber: 2, userId: 'user-2', score: 3, result: 'LOSE', isBot: false, user: { username: 'bob' } },
                    ],
                },
            ]);

            const games = await HistoryService.getGamesByUserId('user-1');
            expect(games).toHaveLength(1);
            expect(mockPrisma.game.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        players: { some: { userId: 'user-1' } },
                    },
                }),
            );
        });

        test('retourne un tableau vide en cas d\'erreur', async () => {
            mockPrisma.game.findMany.mockRejectedValue(new Error('DB down'));
            const games = await HistoryService.getGamesByUserId('user-1');
            expect(games).toHaveLength(0);
        });
    });

    // ================================================================
    // DÉTAIL D'UNE PARTIE
    // ================================================================

    describe('getGameById', () => {
        test('retourne une partie avec les joueurs', async () => {
            mockPrisma.game.findUnique.mockResolvedValue({
                id: 'game-1',
                mode: 'ONLINE',
                players: [
                    { playerNumber: 1, userId: 'user-1', score: 5, result: 'WIN', user: { username: 'alice' } },
                    { playerNumber: 2, userId: 'user-2', score: 3, result: 'LOSE', user: { username: 'bob' } },
                ],
            });

            const game = await HistoryService.getGameById('game-1');
            expect(game).toBeDefined();
        });

        test('retourne null pour une partie inexistante', async () => {
            mockPrisma.game.findUnique.mockResolvedValue(null);
            const game = await HistoryService.getGameById('inexistant');
            expect(game).toBeNull();
        });

        test('retourne null en cas d\'erreur BDD', async () => {
            mockPrisma.game.findUnique.mockRejectedValue(new Error('DB down'));
            const game = await HistoryService.getGameById('game-1');
            expect(game).toBeNull();
        });
    });
});
