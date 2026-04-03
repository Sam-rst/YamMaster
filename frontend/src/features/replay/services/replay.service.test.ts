// frontend/src/features/replay/services/replay.service.test.ts

import ReplayService from './replay.service';

const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

describe('ReplayService', () => {

    beforeEach(() => jest.clearAllMocks());

    describe('getGameWithTurns', () => {
        test('retourne une partie avec ses tours', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    id: 'game-1',
                    turns: [
                        { type: 'roll', playerNumber: 1, data: { rollNumber: 1 } },
                        { type: 'grid', playerNumber: 1, data: { rowIndex: 0, cellIndex: 0 } },
                    ],
                    players: [
                        { playerNumber: 1, user: { username: 'alice' }, result: 'WIN' },
                        { playerNumber: 2, isBot: true, result: 'LOSE' },
                    ],
                }),
            });

            const game = await ReplayService.getGameWithTurns('game-1');

            expect(game).toBeDefined();
            expect(game?.turns).toHaveLength(2);
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/history/game/game-1'));
        });

        test('retourne null pour une partie inexistante', async () => {
            mockFetch.mockResolvedValue({ ok: false, status: 404 });

            const game = await ReplayService.getGameWithTurns('inexistant');
            expect(game).toBeNull();
        });

        test('retourne null en cas d\'erreur réseau', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const game = await ReplayService.getGameWithTurns('game-1');
            expect(game).toBeNull();
        });
    });
});
