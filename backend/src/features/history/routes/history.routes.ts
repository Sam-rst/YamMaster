// backend/src/features/history/routes/history.routes.ts

import { Router, Request, Response } from 'express';
import HistoryService from '../services/history.service';
import { logger } from '../../../shared/logger';

export const historyRouter = Router();

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;

interface GamePlayerWithUser {
    playerNumber: number;
    userId: string | null;
    isBot: boolean;
    score: number;
    tokensLeft: number;
    result: string;
    user: { id: string; username: string } | null;
}

interface GameWithPlayers {
    id: string;
    mode: string;
    status: string;
    reason: string | null;
    createdAt: Date;
    endedAt: Date | null;
    players: GamePlayerWithUser[];
}

const formatGameForUser = (game: GameWithPlayers, userId: string) => {
    const myPlayer = game.players.find(p => p.userId === userId);
    const opponent = game.players.find(p => p.userId !== userId);

    const opponentName = opponent?.isBot ? 'Bot' : (opponent?.user?.username || 'Inconnu');

    return {
        id: game.id,
        mode: game.mode,
        status: game.status,
        reason: game.reason,
        createdAt: game.createdAt,
        endedAt: game.endedAt,
        myScore: myPlayer?.score ?? 0,
        opponentScore: opponent?.score ?? 0,
        myResult: myPlayer?.result ?? 'PENDING',
        opponentName,
        myTokensLeft: myPlayer?.tokensLeft ?? 0,
    };
};

historyRouter.get('/user/:userId', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const userId = req.params.userId;

    try {
        const games = await HistoryService.getGamesByUserId(userId);
        const formatted = (games as GameWithPlayers[]).map(g => formatGameForUser(g, userId));
        res.status(HTTP_OK).json(formatted);
    } catch (error) {
        logger.error('Erreur sur GET /history/user/:userId', { error: error as Error });
        res.status(HTTP_SERVER_ERROR).json([]);
    }
});

historyRouter.get('/game/:gameId', async (req: Request<{ gameId: string }>, res: Response): Promise<void> => {
    const gameId = req.params.gameId;

    try {
        const game = await HistoryService.getGameById(gameId);

        if (!game) {
            res.status(HTTP_NOT_FOUND).json({ error: 'Partie non trouvée' });
            return;
        }

        res.status(HTTP_OK).json(game);
    } catch (error) {
        logger.error('Erreur sur GET /history/game/:gameId', { error: error as Error });
        res.status(HTTP_SERVER_ERROR).json({ error: 'Erreur serveur' });
    }
});
