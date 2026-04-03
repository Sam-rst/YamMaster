// backend/src/features/auth/services/auth.service.ts

import bcrypt from 'bcrypt';
import { getPrismaClient } from '../../../infrastructure/database';
import { logger } from '../../../shared/logger';

const SALT_ROUNDS = 10;

interface AuthResult {
    success: boolean;
    user?: SanitizedUser;
    isNewUser?: boolean;
    error?: string;
}

interface SanitizedUser {
    id: string;
    username: string;
    avatar: string;
    createdAt: Date;
}

interface UserWithPassword {
    id: string;
    username: string;
    password: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}

const AuthService = {

    loginOrRegister: async (username: string, password: string): Promise<AuthResult> => {
        if (!username || username.trim() === '') {
            return { success: false, error: 'Le username est requis' };
        }

        if (!password || password.trim() === '') {
            return { success: false, error: 'Le mot de passe est requis' };
        }

        try {
            const prisma = getPrismaClient();
            const existingUser = await prisma.user.findUnique({ where: { username } });

            if (!existingUser) {
                return AuthService.register(username, password);
            }

            return AuthService.login(existingUser as UserWithPassword, password);
        } catch (error) {
            logger.error('Erreur lors de l\'authentification', { error: error as Error });
            return { success: false, error: 'Erreur serveur' };
        }
    },

    register: async (username: string, password: string): Promise<AuthResult> => {
        const prisma = getPrismaClient();
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await prisma.user.create({
            data: { username, password: hashedPassword },
        });

        logger.info('Nouvel utilisateur créé', { socketId: newUser.id, action: username });

        return {
            success: true,
            user: AuthService.sanitizeUser(newUser as UserWithPassword),
            isNewUser: true,
        };
    },

    login: async (user: UserWithPassword, password: string): Promise<AuthResult> => {
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.warn('Tentative de connexion avec mauvais mot de passe', { action: user.username });
            return { success: false, error: 'Mot de passe incorrect' };
        }

        logger.info('Utilisateur connecté', { socketId: user.id, action: user.username });

        return {
            success: true,
            user: AuthService.sanitizeUser(user),
            isNewUser: false,
        };
    },

    getUserById: async (id: string): Promise<SanitizedUser | null> => {
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) return null;
            return AuthService.sanitizeUser(user as UserWithPassword);
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'utilisateur', { error: error as Error });
            return null;
        }
    },

    checkUsername: async (username: string): Promise<{ exists: boolean }> => {
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({ where: { username } });
            return { exists: user !== null };
        } catch (error) {
            logger.error('Erreur lors de la vérification du username', { error: error as Error });
            return { exists: false };
        }
    },

    sanitizeUser: (user: UserWithPassword): SanitizedUser => {
        return { id: user.id, username: user.username, avatar: user.avatar, createdAt: user.createdAt };
    },
};

export default AuthService;
