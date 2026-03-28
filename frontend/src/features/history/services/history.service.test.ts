// frontend/src/features/history/services/history.service.test.ts
// Tests unitaires du service d'historique frontend

import HistoryService from './history.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HistoryService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getGamesByUserId', () => {
        test('retourne la liste des parties d\'un joueur', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([
                    { id: 'game-1', mode: 'ONLINE', status: 'FINISHED', player1Score: 5, player2Score: 3 },
                    { id: 'game-2', mode: 'VS_BOT', status: 'FINISHED', player1Score: 2, player2Score: 6 },
                ]),
            });

            const games = await HistoryService.getGamesByUserId('user-1');

            expect(games).toHaveLength(2);
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/history/user/user-1'));
        });

        test('retourne un tableau vide en cas d\'erreur', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const games = await HistoryService.getGamesByUserId('user-1');

            expect(games).toHaveLength(0);
        });
    });

    describe('getGameById', () => {
        test('retourne le détail d\'une partie', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    id: 'game-1',
                    mode: 'ONLINE',
                    player1: { username: 'alice' },
                    player2: { username: 'bob' },
                }),
            });

            const game = await HistoryService.getGameById('game-1');

            expect(game).toBeDefined();
            expect(game?.id).toBe('game-1');
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/history/game/game-1'));
        });

        test('retourne null pour une partie inexistante', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Partie non trouvée' }),
            });

            const game = await HistoryService.getGameById('inexistant');

            expect(game).toBeNull();
        });

        test('retourne null en cas d\'erreur réseau', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const game = await HistoryService.getGameById('game-1');

            expect(game).toBeNull();
        });
    });
});
