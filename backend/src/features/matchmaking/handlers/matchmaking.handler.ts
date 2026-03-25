// backend/src/features/matchmaking/handlers/matchmaking.handler.ts

import { Socket } from 'socket.io';
import uniqid from 'uniqid';
import GameService from '../../game/services/game.service';
import { Game, SocketLike } from '../../../shared/types';
import {
    updateClientsViewTimers,
    updateClientsViewDecks,
    updateClientsViewGrid,
    updateClientsViewScores,
    startGameTimer,
} from '../../game/handlers/game.handler';
import { createBotSocket, setupBotListeners } from '../../bot/handlers/bot.handler';

const queue: Socket[] = [];

/** Reset la queue (utilisé dans les tests) */
export const resetQueue = (): void => { queue.length = 0; };

export const createGame = (player1Socket: SocketLike, player2Socket: SocketLike, games: Game[]): void => {
    const newGame = GameService.init.gameState() as unknown as Game;
    newGame.idGame = uniqid();
    newGame.player1Socket = player1Socket;
    newGame.player2Socket = player2Socket;
    games.push(newGame);

    player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', newGame));
    player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', newGame));
    updateClientsViewTimers(newGame);
    updateClientsViewDecks(newGame);
    updateClientsViewGrid(newGame);
    updateClientsViewScores(newGame);
    startGameTimer(newGame, games);

    player1Socket.on('disconnect', () => { clearInterval(newGame.gameInterval); });
    player2Socket.on('disconnect', () => { clearInterval(newGame.gameInterval); });
};

export const createGameVsBot = (playerSocket: SocketLike, games: Game[]): void => {
    const botSocket = createBotSocket();
    const newGame = GameService.init.gameState() as unknown as Game;
    newGame.idGame = uniqid();
    newGame.player1Socket = playerSocket;
    newGame.player2Socket = botSocket;
    games.push(newGame);

    setupBotListeners(botSocket, newGame, games);

    playerSocket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', newGame));
    botSocket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', newGame));
    updateClientsViewTimers(newGame);
    updateClientsViewDecks(newGame);
    updateClientsViewGrid(newGame);
    updateClientsViewScores(newGame);
    startGameTimer(newGame, games);

    playerSocket.on('disconnect', () => {
        const gi = games.indexOf(newGame);
        if (gi !== -1) {
            clearInterval(games[gi].gameInterval);
            games.splice(gi, 1);
        }
    });
};

export const newPlayerInQueue = (socket: Socket, games: Game[]): void => {
    queue.push(socket);
    if (queue.length >= 2) {
        const p1 = queue.shift()!;
        const p2 = queue.shift()!;
        createGame(p1, p2, games);
    } else {
        socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
    }
};
