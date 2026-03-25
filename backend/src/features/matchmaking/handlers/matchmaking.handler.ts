// backend/src/features/matchmaking/handlers/matchmaking.handler.ts

import { Socket } from 'socket.io';
import uniqid from 'uniqid';
import GameService from '../../game/services/game.service';
import { Game, SocketLike } from '../../../shared/types';
import { logger } from '../../../shared/logger';
import {
    updateClientsViewTimers,
    updateClientsViewDecks,
    updateClientsViewGrid,
    updateClientsViewScores,
    startGameTimer,
} from '../../game/handlers/game.handler';
import { createBotSocket, setupBotListeners } from '../../bot/handlers/bot.handler';

const MINIMUM_PLAYERS_FOR_MATCH = 2;
const queue: Socket[] = [];

/** Reset la queue (utilisé dans les tests) */
export const resetQueue = (): void => { queue.length = 0; };

const initializeGame = (player1Socket: SocketLike, player2Socket: SocketLike): Game => {
    const newGame = GameService.init.gameState() as unknown as Game;
    newGame.idGame = uniqid();
    newGame.player1Socket = player1Socket;
    newGame.player2Socket = player2Socket;
    return newGame;
};

const broadcastInitialState = (game: Game): void => {
    game.player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', game));
    game.player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', game));
    updateClientsViewTimers(game);
    updateClientsViewDecks(game);
    updateClientsViewGrid(game);
    updateClientsViewScores(game);
};

const removeGameOnDisconnect = (game: Game, games: Game[]): void => {
    const gameIndex = games.indexOf(game);
    if (gameIndex === -1) return;

    clearInterval(games[gameIndex].gameInterval);
    games.splice(gameIndex, 1);
    logger.info('Partie supprimée suite à déconnexion', { gameId: game.idGame });
};

export const createGame = (player1Socket: SocketLike, player2Socket: SocketLike, games: Game[]): void => {
    try {
        const newGame = initializeGame(player1Socket, player2Socket);
        games.push(newGame);

        broadcastInitialState(newGame);
        startGameTimer(newGame, games);

        player1Socket.on('disconnect', () => { clearInterval(newGame.gameInterval); });
        player2Socket.on('disconnect', () => { clearInterval(newGame.gameInterval); });

        logger.info('Partie en ligne créée', {
            gameId: newGame.idGame,
            socketId: `${player1Socket.id} vs ${player2Socket.id}`,
        });
    } catch (error) {
        logger.error('Erreur lors de la création de partie', { error: error as Error });
    }
};

export const createGameVsBot = (playerSocket: SocketLike, games: Game[]): void => {
    try {
        const botSocket = createBotSocket();
        const newGame = initializeGame(playerSocket, botSocket);
        games.push(newGame);

        setupBotListeners(botSocket, newGame, games);
        broadcastInitialState(newGame);
        startGameTimer(newGame, games);

        playerSocket.on('disconnect', () => removeGameOnDisconnect(newGame, games));

        logger.info('Partie VsBot créée', {
            gameId: newGame.idGame,
            socketId: playerSocket.id,
        });
    } catch (error) {
        logger.error('Erreur lors de la création de partie VsBot', { error: error as Error });
    }
};

export const newPlayerInQueue = (socket: Socket, games: Game[]): void => {
    queue.push(socket);

    if (queue.length >= MINIMUM_PLAYERS_FOR_MATCH) {
        const player1 = queue.shift()!;
        const player2 = queue.shift()!;
        createGame(player1, player2, games);
        logger.info('Match trouvé', { socketId: `${player1.id} vs ${player2.id}` });
    } else {
        socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
        logger.info('Joueur en attente dans la queue', { socketId: socket.id });
    }
};
