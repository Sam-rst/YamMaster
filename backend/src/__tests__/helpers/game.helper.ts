// backend/src/__tests__/helpers/game.helper.ts
// Factory pour créer des états de jeu utilisables dans les tests

import uniqid from 'uniqid';
import GameService from '../../features/game/services/game.service';
import { Game, GameState } from '../../shared/types';
import { createMockSocket, MockSocket } from './socket.helper';

export interface MockGame extends Game {
    player1Socket: MockSocket;
    player2Socket: MockSocket;
}

export const createMockGame = (options?: {
    player1Id?: string;
    player2Id?: string;
}): { game: MockGame; games: Game[] } => {
    const player1Socket = createMockSocket(options?.player1Id || 'player1-' + uniqid());
    const player2Socket = createMockSocket(options?.player2Id || 'player2-' + uniqid());

    const game = GameService.init.gameState() as unknown as MockGame;
    game.idGame = 'game-' + uniqid();
    game.player1Socket = player1Socket;
    game.player2Socket = player2Socket;

    const games: Game[] = [game];

    return { game, games };
};

export const createMockGameState = (): GameState => {
    return GameService.init.gameState().gameState;
};

/**
 * Remplit la grille avec des pions pour simuler une fin de partie proche
 */
export const fillGridPartially = (game: MockGame, count: number, player: 'player:1' | 'player:2'): void => {
    let placed = 0;
    for (let row = 0; row < game.gameState.grid.length && placed < count; row++) {
        for (let col = 0; col < game.gameState.grid[row].length && placed < count; col++) {
            if (!game.gameState.grid[row][col].owner) {
                game.gameState.grid[row][col].owner = player;
                placed++;
            }
        }
    }
    if (player === 'player:1') game.gameState.player1Tokens -= placed;
    else game.gameState.player2Tokens -= placed;
};
