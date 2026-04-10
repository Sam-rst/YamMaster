// backend/src/infrastructure/database.ts
// Client Prisma singleton — une seule connexion à la BDD

import { PrismaClient } from '../generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { logger } from '../shared/logger';

let prismaInstance: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
    if (!prismaInstance) {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL non définie');
        }

        const adapter = new PrismaNeon({ connectionString: databaseUrl });
        prismaInstance = new PrismaClient({ adapter });
        logger.info('Connexion à la base de données établie');
    }
    return prismaInstance;
};

export const disconnectDatabase = async (): Promise<void> => {
    if (prismaInstance) {
        await prismaInstance.$disconnect();
        prismaInstance = null;
        logger.info('Connexion à la base de données fermée');
    }
};
