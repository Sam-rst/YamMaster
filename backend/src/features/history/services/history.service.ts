// backend/src/features/history/services/history.service.ts

import { getPrismaClient } from '../../../infrastructure/database';
import { Prisma } from '../../../generated/prisma/client';
import { logger } from '../../../shared/logger';

interface PlayerInput {
    userId: string | null;
    playerNumber: number;
    isBot: boolean;
}

interface CreateGameInput {
    mode: 'ONLINE' | 'VS_BOT';
    players: PlayerInput[];
}

interface PlayerResultInput {
    playerNumber: number;
    score: number;
    tokensLeft: number;
    result: 'WIN' | 'LOSE' | 'DRAW';
}

interface FinishGameInput {
    reason: string;
    playerResults: PlayerResultInput[];
}

const HistoryService = {

    createGame: async (input: CreateGameInput) => {
        try {
            const prisma = getPrismaClient();
            const game = await prisma.game.create({
                data: {
                    mode: input.mode,
                    players: {
                        create: input.players.map((p) => ({
                            playerNumber: p.playerNumber,
                            userId: p.userId,
                            isBot: p.isBot,
                        })),
                    },
                },
                include: { players: true },
            });

            logger.info('Partie enregistrée en BDD', { gameId: game.id, action: input.mode });
            return game;
        } catch (error) {
            logger.error('Erreur lors de la création de la partie en BDD', { error: error as Error });
            throw error;
        }
    },

    finishGame: async (gameId: string, input: FinishGameInput) => {
        try {
            const prisma = getPrismaClient();

            // Mettre à jour le status de la partie
            await prisma.game.update({
                where: { id: gameId },
                data: {
                    status: 'FINISHED',
                    reason: input.reason,
                    endedAt: new Date(),
                },
            });

            // Mettre à jour chaque joueur
            for (const playerResult of input.playerResults) {
                const safeScore = Number.isFinite(playerResult.score) ? playerResult.score : 0;

                await prisma.gamePlayer.updateMany({
                    where: { gameId, playerNumber: playerResult.playerNumber },
                    data: {
                        score: safeScore,
                        tokensLeft: playerResult.tokensLeft,
                        result: playerResult.result,
                    },
                });
            }

            logger.info('Partie terminée en BDD', { gameId, action: input.reason });
        } catch (error) {
            logger.error('Erreur lors de la fin de partie en BDD', { gameId, error: error as Error });
            throw error;
        }
    },

    saveTurns: async (gameId: string, turns: Record<string, unknown>[]) => {
        try {
            const prisma = getPrismaClient();
            await prisma.game.update({
                where: { id: gameId },
                data: { turns: turns as unknown as Prisma.InputJsonValue },
            });
            logger.info('Tours sauvegardés', { gameId, action: `${turns.length} tours` });
        } catch (error) {
            logger.error('Erreur lors de la sauvegarde des tours', { gameId, error: error as Error });
            throw error;
        }
    },

    getGamesByUserId: async (userId: string) => {
        try {
            const prisma = getPrismaClient();
            return await prisma.game.findMany({
                where: {
                    players: { some: { userId } },
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    players: {
                        include: { user: { select: { id: true, username: true } } },
                        orderBy: { playerNumber: 'asc' },
                    },
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la récupération des parties', { error: error as Error });
            return [];
        }
    },

    getGameById: async (gameId: string) => {
        try {
            const prisma = getPrismaClient();
            return await prisma.game.findUnique({
                where: { id: gameId },
                include: {
                    players: {
                        include: { user: { select: { id: true, username: true } } },
                        orderBy: { playerNumber: 'asc' },
                    },
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la récupération de la partie', { gameId, error: error as Error });
            return null;
        }
    },
};

export default HistoryService;
