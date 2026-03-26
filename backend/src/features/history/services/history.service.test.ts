// backend/src/features/history/services/history.service.test.ts
// Tests unitaires du service d'historique des parties

import HistoryService from './history.service';

// Mock Prisma
const mockPrisma = {
    game: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
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
        test('crée une partie en ligne avec les deux joueurs', async () => {
            mockPrisma.game.create.mockResolvedValue({
                id: 'game-1',
                mode: 'ONLINE',
                status: 'IN_PROGRESS',
                player1Id: 'user-1',
                player2Id: 'user-2',
                createdAt: new Date(),
            });

            const result = await HistoryService.createGame({
                mode: 'ONLINE',
                player1Id: 'user-1',
                player2Id: 'user-2',
            });

            expect(result).toBeDefined();
            expect(result.mode).toBe('ONLINE');
            expect(mockPrisma.game.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    mode: 'ONLINE',
                    player1: { connect: { id: 'user-1' } },
                    player2: { connect: { id: 'user-2' } },
                }),
            });
        });

        test('crée une partie VsBot sans player2Id', async () => {
            mockPrisma.game.create.mockResolvedValue({
                id: 'game-2',
                mode: 'VS_BOT',
                status: 'IN_PROGRESS',
                player1Id: 'user-1',
                player2Id: null,
                createdAt: new Date(),
            });

            const result = await HistoryService.createGame({
                mode: 'VS_BOT',
                player1Id: 'user-1',
            });

            expect(result).toBeDefined();
            expect(result.mode).toBe('VS_BOT');
        });
    });

    // ================================================================
    // TERMINER UNE PARTIE
    // ================================================================

    describe('finishGame', () => {
        test('met à jour la partie avec le résultat', async () => {
            mockPrisma.game.update.mockResolvedValue({
                id: 'game-1',
                status: 'FINISHED',
                winnerId: 'user-1',
                player1Score: 5,
                player2Score: 3,
                reason: 'alignment5',
                endedAt: new Date(),
            });

            const result = await HistoryService.finishGame('game-1', {
                winnerId: 'user-1',
                player1Score: 5,
                player2Score: 3,
                reason: 'alignment5',
            });

            expect(result.status).toBe('FINISHED');
            expect(result.winnerId).toBe('user-1');
            expect(mockPrisma.game.update).toHaveBeenCalledWith({
                where: { id: 'game-1' },
                data: expect.objectContaining({
                    status: 'FINISHED',
                    winner: { connect: { id: 'user-1' } },
                    player1Score: 5,
                    player2Score: 3,
                    reason: 'alignment5',
                    endedAt: expect.any(Date),
                }),
            });
        });

        test('peut terminer une partie sans vainqueur (égalité)', async () => {
            mockPrisma.game.update.mockResolvedValue({
                id: 'game-1',
                status: 'FINISHED',
                winnerId: null,
                player1Score: 4,
                player2Score: 4,
                reason: 'noTokens',
            });

            const result = await HistoryService.finishGame('game-1', {
                winnerId: null,
                player1Score: 4,
                player2Score: 4,
                reason: 'noTokens',
            });

            expect(result.winnerId).toBeNull();
        });
    });

    // ================================================================
    // SAUVEGARDER LES TOURS (REPLAY)
    // ================================================================

    describe('saveTurns', () => {
        test('sauvegarde les données de tour en JSON', async () => {
            const turns = [
                { turn: 1, player: 'player:1', action: 'roll', dices: [1,2,3,4,5] },
                { turn: 2, player: 'player:2', action: 'roll', dices: [6,6,3,2,1] },
            ];

            mockPrisma.game.update.mockResolvedValue({ id: 'game-1', turns });

            await HistoryService.saveTurns('game-1', turns);

            expect(mockPrisma.game.update).toHaveBeenCalledWith({
                where: { id: 'game-1' },
                data: { turns },
            });
        });
    });

    // ================================================================
    // LISTER LES PARTIES D'UN JOUEUR
    // ================================================================

    describe('getGamesByUserId', () => {
        test('retourne les parties d\'un joueur triées par date', async () => {
            mockPrisma.game.findMany.mockResolvedValue([
                { id: 'game-2', createdAt: new Date('2026-03-26'), player1Id: 'user-1', status: 'FINISHED' },
                { id: 'game-1', createdAt: new Date('2026-03-25'), player1Id: 'user-1', status: 'FINISHED' },
            ]);

            const games = await HistoryService.getGamesByUserId('user-1');

            expect(games).toHaveLength(2);
            expect(mockPrisma.game.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            { player1Id: 'user-1' },
                            { player2Id: 'user-1' },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                }),
            );
        });

        test('retourne un tableau vide si pas de parties', async () => {
            mockPrisma.game.findMany.mockResolvedValue([]);

            const games = await HistoryService.getGamesByUserId('user-new');
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
                player1: { id: 'user-1', username: 'alice' },
                player2: { id: 'user-2', username: 'bob' },
                winner: { id: 'user-1', username: 'alice' },
            });

            const game = await HistoryService.getGameById('game-1');

            expect(game).toBeDefined();
            expect(mockPrisma.game.findUnique).toHaveBeenCalledWith({
                where: { id: 'game-1' },
                include: expect.objectContaining({
                    player1: true,
                    player2: true,
                    winner: true,
                }),
            });
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

    // ================================================================
    // ERREURS BDD
    // ================================================================

    describe('erreurs BDD', () => {
        test('createGame propage l\'erreur', async () => {
            mockPrisma.game.create.mockRejectedValue(new Error('DB down'));

            await expect(HistoryService.createGame({
                mode: 'ONLINE',
                player1Id: 'user-1',
                player2Id: 'user-2',
            })).rejects.toThrow('DB down');
        });

        test('finishGame propage l\'erreur', async () => {
            mockPrisma.game.update.mockRejectedValue(new Error('DB down'));

            await expect(HistoryService.finishGame('game-1', {
                winnerId: null,
                player1Score: 0,
                player2Score: 0,
                reason: 'noTokens',
            })).rejects.toThrow('DB down');
        });

        test('saveTurns propage l\'erreur', async () => {
            mockPrisma.game.update.mockRejectedValue(new Error('DB down'));

            await expect(HistoryService.saveTurns('game-1', [{ turn: 1 }])).rejects.toThrow('DB down');
        });

        test('getGamesByUserId retourne un tableau vide en cas d\'erreur', async () => {
            mockPrisma.game.findMany.mockRejectedValue(new Error('DB down'));

            const games = await HistoryService.getGamesByUserId('user-1');
            expect(games).toHaveLength(0);
        });
    });
});
