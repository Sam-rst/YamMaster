// backend/src/infrastructure/socket.setup.ts

import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import GameService from '../features/game/services/game.service';
import { Game, PlayerKey } from '../shared/types';
import { newPlayerInQueue, createGameVsBot } from '../features/matchmaking/handlers/matchmaking.handler';
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

export const createServer = (): { app: ReturnType<typeof express>; server: http.Server; io: Server } => {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);
    return { app, server, io };
};

export const setupSocketHandlers = (io: Server, games: Game[]): void => {
    io.on('connection', (socket: Socket) => {
        console.log(`[${socket.id}] socket connected`);

        socket.on('queue.join', () => {
            console.log(`[${socket.id}] new player in queue`);
            newPlayerInQueue(socket, games);
        });

        socket.on('game.vsbot', () => {
            console.log(`[${socket.id}] starting game vs bot`);
            createGameVsBot(socket, games);
        });

        socket.on('game.dices.roll', () => {
            const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
            if (gi === -1) return;
            handleDiceRoll(games[gi]);
        });

        socket.on('game.dices.lock', (idDice: number) => {
            const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
            if (gi === -1) return;
            handleDiceLock(games[gi], idDice);
        });

        socket.on('game.defi', () => {
            const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
            if (gi === -1) return;
            handleDefi(games[gi]);
        });

        socket.on('game.grid.yamPredator', (data: { rowIndex: number; cellIndex: number }) => {
            const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
            if (gi === -1) return;
            handleYamPredator(games[gi], games, data);
        });

        socket.on('game.choices.selected', (data: { choiceId: string }) => {
            const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
            if (gi === -1) return;
            handleChoiceSelected(games[gi], data.choiceId);
        });

        socket.on('game.grid.selected', (data: { cellId: string; rowIndex: number; cellIndex: number }) => {
            const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
            if (gi === -1) return;
            handleGridSelected(games[gi], games, data);
        });

        if (DEV_MODE) {
            socket.on('game.dev.place', (data: { rowIndex: number; cellIndex: number; owner: PlayerKey }) => {
                const gi = GameService.utils.findGameIndexBySocketId(games, socket.id);
                if (gi === -1) return;
                handleDevPlace(games[gi], games, data);
            });
        }

        socket.on('disconnect', (reason: string) => {
            console.log(`[${socket.id}] socket disconnected - ${reason}`);
        });
    });
};
