// backend/src/features/profile/routes/profile.routes.ts

import { Router, Request, Response } from 'express';
import ProfileService from '../services/profile.service';
import { logger } from '../../../shared/logger';

const VALID_AVATARS = ['🎲', '👑', '🎯', '⚡', '🔥', '🏆', '💎', '🐉'];

export const profileRouter = Router();

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;

profileRouter.get('/:userId', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const { userId } = req.params;

    try {
        const stats = await ProfileService.getProfileStats(userId);

        if (!stats) {
            res.status(HTTP_NOT_FOUND).json({ error: 'Profil introuvable' });
            return;
        }

        res.status(HTTP_OK).json(stats);
    } catch (error) {
        logger.error('Erreur sur GET /profile/:userId', { error: error as Error });
        res.status(HTTP_SERVER_ERROR).json({ error: 'Erreur serveur' });
    }
});

profileRouter.put('/:userId/avatar', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { avatar } = req.body as { avatar?: string };

    if (!avatar) {
        res.status(HTTP_BAD_REQUEST).json({ error: 'Le champ avatar est requis' });
        return;
    }

    if (!VALID_AVATARS.includes(avatar)) {
        res.status(HTTP_BAD_REQUEST).json({ error: `Avatar invalide : "${avatar}". Avatars autorisés : ${VALID_AVATARS.join(', ')}` });
        return;
    }

    try {
        const user = await ProfileService.updateAvatar(userId, avatar);
        res.status(HTTP_OK).json(user);
    } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.startsWith('Avatar invalide')) {
            res.status(HTTP_BAD_REQUEST).json({ error: message });
            return;
        }
        logger.error('Erreur sur PUT /profile/:userId/avatar', { error: error as Error });
        res.status(HTTP_SERVER_ERROR).json({ error: 'Erreur serveur' });
    }
});
