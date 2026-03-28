// backend/src/features/auth/routes/auth.routes.ts
// Routes REST pour l'authentification

import { Router, Request, Response } from 'express';
import AuthService from '../services/auth.service';
import { logger } from '../../../shared/logger';

export const authRouter = Router();

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_SERVER_ERROR = 500;

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(HTTP_BAD_REQUEST).json({
            success: false,
            error: 'Username et mot de passe requis',
        });
        return;
    }

    try {
        const result = await AuthService.loginOrRegister(username, password);

        if (!result.success) {
            res.status(HTTP_UNAUTHORIZED).json(result);
            return;
        }

        const statusCode = result.isNewUser ? HTTP_CREATED : HTTP_OK;
        res.status(statusCode).json(result);
    } catch (error) {
        logger.error('Erreur sur POST /auth/login', { error: error as Error });
        res.status(HTTP_SERVER_ERROR).json({ success: false, error: 'Erreur serveur' });
    }
});

authRouter.get('/check/:username', async (req: Request<{ username: string }>, res: Response): Promise<void> => {
    const username = req.params.username;

    try {
        const result = await AuthService.checkUsername(username);
        res.status(HTTP_OK).json(result);
    } catch (error) {
        logger.error('Erreur sur GET /auth/check/:username', { error: error as Error });
        res.status(HTTP_SERVER_ERROR).json({ exists: false });
    }
});
