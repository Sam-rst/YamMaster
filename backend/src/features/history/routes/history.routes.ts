// backend/src/features/history/routes/history.routes.ts

import { Router, Request, Response } from 'express';
import HistoryService from '../services/history.service';
import { logger } from '../../../shared/logger';

export const historyRouter = Router();

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;

historyRouter.get('/user/:userId', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const userId = req.params.userId;

    try {
        const games = await HistoryService.getGamesByUserId(userId);
        res.status(HTTP_OK).json(games);
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
