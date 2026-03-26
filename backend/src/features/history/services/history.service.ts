// backend/src/features/history/services/history.service.ts

import { getPrismaClient } from '../../../infrastructure/database';
import { Prisma } from '../../../generated/prisma/client';
import { logger } from '../../../shared/logger';

interface CreateGameInput {
    mode: 'ONLINE' | 'VS_BOT';
    player1Id: string;
    player2Id?: string;
}

interface FinishGameInput {
    winnerId: string | null;
    player1Score: number;
    player2Score: number;
    reason: string;
}

const HistoryService = {

    createGame: async (input: CreateGameInput) => {
        try {
            const prisma = getPrismaClient();
            const game = await prisma.game.create({
                data: {
                    mode: input.mode,
                    player1: { connect: { id: input.player1Id } },
                    ...(input.player2Id ? { player2: { connect: { id: input.player2Id } } } : {}),
                },
            });

            logger.info('Partie enregistrée en BDD', { gameId: game.id, action: input.mode });
            return game;
        } catch (error) {
            logger.error('Erreur lors de la création de la partie en BDD', { error: error as Error });
            throw error;
        }
    },

    finishGame: async (gameId: string, result: FinishGameInput) => {
        try {
            const prisma = getPrismaClient();
            const safeScore = (score: number): number =>
                Number.isFinite(score) ? score : 0;

            const game = await prisma.game.update({
                where: { id: gameId },
                data: {
                    status: 'FINISHED',
                    ...(result.winnerId ? { winner: { connect: { id: result.winnerId } } } : {}),
                    player1Score: safeScore(result.player1Score),
                    player2Score: safeScore(result.player2Score),
                    reason: result.reason,
                    endedAt: new Date(),
                },
            });

            logger.info('Partie terminée en BDD', {
                gameId,
                action: `${result.player1Score}-${result.player2Score} (${result.reason})`,
            });
            return game;
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
                    OR: [
                        { player1Id: userId },
                        { player2Id: userId },
                    ],
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    player1: { select: { id: true, username: true } },
                    player2: { select: { id: true, username: true } },
                    winner: { select: { id: true, username: true } },
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
                    player1: true,
                    player2: true,
                    winner: true,
                },
            });
        } catch (error) {
            logger.error('Erreur lors de la récupération de la partie', { gameId, error: error as Error });
            return null;
        }
    },
};

export default HistoryService;
