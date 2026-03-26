// backend/src/infrastructure/socket.setup.ts

import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import GameService from '../features/game/services/game.service';
import { Game, PlayerKey } from '../shared/types';
import { logger } from '../shared/logger';
import { newPlayerInQueue, createGameVsBot, removeFromQueueBySocketId } from '../features/matchmaking/handlers/matchmaking.handler';
import {
    handleDiceRoll,
    handleDiceLock,
    handleChoiceSelected,
    handleGridSelected,
    handleDefi,
    handleYamPredator,
    handleDevPlace,
} from '../features/game/handlers/game.handler';

const DEV_MODE = process.env.DEV_MODE === 'true';

export const getPlayerKeyFromSocket = (game: Game, socketId: string): PlayerKey | null => {
    if (game.player1Socket.id === socketId) return 'player:1';
    if (game.player2Socket.id === socketId) return 'player:2';
    return null;
};

export const isCurrentPlayerTurn = (game: Game, socketId: string): boolean => {
    const playerKey = getPlayerKeyFromSocket(game, socketId);
    return playerKey !== null && playerKey === game.gameState.currentTurn;
};

import { authRouter } from '../features/auth/routes/auth.routes';

export const createServer = (): { app: ReturnType<typeof express>; server: http.Server; io: Server } => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);

    const server = http.createServer(app);
    const io = new Server(server);
    return { app, server, io };
};

const findGameAndValidateTurn = (games: Game[], socketId: string, action: string): Game | null => {
    const game = findGameOrWarn(games, socketId, action);
    if (!game) return null;

    if (!isCurrentPlayerTurn(game, socketId)) {
        const playerKey = getPlayerKeyFromSocket(game, socketId);
        logger.warn('Action rejetée : pas le tour du joueur', {
            socketId,
            action,
            gameId: game.idGame,
            player: playerKey ?? undefined,
            currentTurn: game.gameState.currentTurn,
        });
        return null;
    }

    return game;
};

const findGameOrWarn = (games: Game[], socketId: string, action: string): Game | null => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socketId);

    if (gameIndex === -1) {
        logger.warn('Partie non trouvée pour l\'action', { socketId, action });
        return null;
    }

    return games[gameIndex];
};

const safeHandler = (action: string, socketId: string, handler: () => void): void => {
    try {
        handler();
    } catch (error) {
        logger.error(`Erreur non gérée sur [${action}]`, {
            socketId,
            error: error as Error,
        });
    }
};

const logServerState = (games: Game[], context: string): void => {
    logger.info(`[État serveur] ${context}`, {
        action: `parties: ${games.length}, IDs: [${games.map(g => g.idGame).join(', ')}]`,
    });
};

export const setupSocketHandlers = (io: Server, games: Game[]): void => {
    io.on('connection', (socket: Socket) => {
        logger.info('Socket connecté', { socketId: socket.id });
        logServerState(games, 'après connexion');

        socket.on('queue.join', () => {
            safeHandler('queue.join', socket.id, () => {
                newPlayerInQueue(socket, games);
                logServerState(games, 'après queue.join');
            });
        });

        socket.on('game.vsbot', () => {
            safeHandler('game.vsbot', socket.id, () => {
                createGameVsBot(socket, games);
                logServerState(games, 'après game.vsbot');
            });
        });

        socket.on('game.dices.roll', () => {
            safeHandler('game.dices.roll', socket.id, () => {
                const game = findGameAndValidateTurn(games, socket.id, 'game.dices.roll');
                if (!game) return;
                handleDiceRoll(game);
            });
        });

        socket.on('game.dices.lock', (diceId: number) => {
            safeHandler('game.dices.lock', socket.id, () => {
                const game = findGameAndValidateTurn(games, socket.id, 'game.dices.lock');
                if (!game) return;
                handleDiceLock(game, diceId);
            });
        });

        socket.on('game.defi', () => {
            safeHandler('game.defi', socket.id, () => {
                const game = findGameAndValidateTurn(games, socket.id, 'game.defi');
                if (!game) return;
                handleDefi(game);
            });
        });

        socket.on('game.grid.yamPredator', (data: { rowIndex: number; cellIndex: number }) => {
            safeHandler('game.grid.yamPredator', socket.id, () => {
                const game = findGameAndValidateTurn(games, socket.id, 'game.grid.yamPredator');
                if (!game) return;
                handleYamPredator(game, data);
            });
        });

        socket.on('game.choices.selected', (data: { choiceId: string }) => {
            safeHandler('game.choices.selected', socket.id, () => {
                const game = findGameAndValidateTurn(games, socket.id, 'game.choices.selected');
                if (!game) return;
                handleChoiceSelected(game, data.choiceId);
            });
        });

        socket.on('game.grid.selected', (data: { cellId: string; rowIndex: number; cellIndex: number }) => {
            safeHandler('game.grid.selected', socket.id, () => {
                const game = findGameAndValidateTurn(games, socket.id, 'game.grid.selected');
                if (!game) return;
                handleGridSelected(game, games, data);
            });
        });

        if (DEV_MODE) {
            socket.on('game.dev.place', (data: { rowIndex: number; cellIndex: number; owner: PlayerKey }) => {
                safeHandler('game.dev.place', socket.id, () => {
                    const game = findGameOrWarn(games, socket.id, 'game.dev.place');
                    if (!game) return;
                    handleDevPlace(game, games, data);
                });
            });
        }

        socket.on('disconnect', (reason: string) => {
            removeFromQueueBySocketId(socket.id);
            logger.info('Socket déconnecté', { socketId: socket.id, action: reason });
            logServerState(games, 'après déconnexion');
        });
    });
};
