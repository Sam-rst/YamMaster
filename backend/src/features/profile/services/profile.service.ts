// backend/src/features/profile/services/profile.service.ts

import { getPrismaClient } from '../../../infrastructure/database';
import { logger } from '../../../shared/logger';

export interface RankInfo {
    name: string;
    tier: string;
    color: string;
}

export interface ProfileStats {
    userId: string;
    username: string;
    avatar: string;
    createdAt: string;
    rank: RankInfo;
    stats: {
        totalGames: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        onlineGames: number;
        botGames: number;
        bestWinStreak: number;
        averageScore: number;
        favoriteBotDifficulty: string | null;
    };
}

export const VALID_AVATARS = ['🎲', '👑', '🎯', '⚡', '🔥', '🏆', '💎', '🐉'];

const RANK_THRESHOLDS = [
    { name: 'Maître', min: 50 },
    { name: 'Diamant', min: 30 },
    { name: 'Or', min: 15 },
    { name: 'Argent', min: 5 },
    { name: 'Bronze', min: 0 },
];

const SUB_TIER_BOUNDARIES = [0, 0.25, 0.5, 0.75, 1.0];
const SUB_TIER_NAMES = ['IV', 'III', 'II', 'I'];

const RANK_COLORS: Record<string, string> = {
    'Maître': '#e94560',
    'Diamant': '#00d2ff',
    'Or': '#f4d35e',
    'Argent': '#c0c0c0',
    'Bronze': '#cd7f32',
};

export const computeRank = (wins: number): RankInfo => {
    const tier = RANK_THRESHOLDS.find(t => wins >= t.min) ?? RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
    const nextTier = RANK_THRESHOLDS.find(t => t.min > tier.min);
    const color = RANK_COLORS[tier.name] ?? '#cd7f32';

    if (!nextTier) {
        return { name: tier.name, tier: '', color };
    }

    const rangeSize = nextTier.min - tier.min;
    const progress = (wins - tier.min) / rangeSize;
    const subIndex = SUB_TIER_BOUNDARIES.findIndex((boundary, i) =>
        i < SUB_TIER_BOUNDARIES.length - 1 && progress < SUB_TIER_BOUNDARIES[i + 1]
    );
    const subTier = subIndex >= 0 ? SUB_TIER_NAMES[subIndex] : SUB_TIER_NAMES[SUB_TIER_NAMES.length - 1];

    return { name: tier.name, tier: subTier, color };
};

const computeBestWinStreak = (results: string[]): number => {
    let bestStreak = 0;
    let currentStreak = 0;

    for (const result of results) {
        if (result === 'WIN') {
            currentStreak++;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }
        } else {
            currentStreak = 0;
        }
    }

    return bestStreak;
};

const computeFavoriteBotDifficulty = (botGamesData: Array<{ difficulty: string | null }>): string | null => {
    const counts: Record<string, number> = {};

    for (const game of botGamesData) {
        if (game.difficulty) {
            counts[game.difficulty] = (counts[game.difficulty] ?? 0) + 1;
        }
    }

    const entries = Object.entries(counts);
    if (entries.length === 0) return null;

    return entries.reduce((best, current) => current[1] > best[1] ? current : best)[0];
};

interface GamePlayerRecord {
    result: string;
    score: number;
    isBot: boolean;
    difficulty: string | null;
    game: { mode: string; createdAt: Date };
}

const computeStats = (players: GamePlayerRecord[], userId: string, username: string, avatar: string, createdAt: Date): ProfileStats => {
    const totalGames = players.length;
    const wins = players.filter(p => p.result === 'WIN').length;
    const losses = players.filter(p => p.result === 'LOSE').length;
    const draws = players.filter(p => p.result === 'DRAW').length;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    const onlineGames = players.filter(p => p.game.mode === 'ONLINE').length;
    const botGames = players.filter(p => p.game.mode === 'VS_BOT').length;
    const bestWinStreak = computeBestWinStreak(players.map(p => p.result));
    const averageScore = totalGames > 0
        ? Math.round((players.reduce((sum, p) => sum + p.score, 0) / totalGames) * 10) / 10
        : 0;
    const botGamesList = players.filter(p => p.game.mode === 'VS_BOT');
    const favoriteBotDifficulty = computeFavoriteBotDifficulty(botGamesList);
    const rank = computeRank(wins);

    return {
        userId,
        username,
        avatar,
        createdAt: createdAt.toISOString(),
        rank,
        stats: {
            totalGames,
            wins,
            losses,
            draws,
            winRate,
            onlineGames,
            botGames,
            bestWinStreak,
            averageScore,
            favoriteBotDifficulty,
        },
    };
};

const ProfileService = {

    getProfileStats: async (userId: string): Promise<ProfileStats | null> => {
        try {
            const prisma = getPrismaClient();

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                logger.warn('Profil introuvable pour userId', { action: userId });
                return null;
            }

            const players = await prisma.gamePlayer.findMany({
                where: { userId },
                include: {
                    game: {
                        select: { mode: true, createdAt: true },
                    },
                },
                orderBy: { game: { createdAt: 'asc' } },
            });

            logger.info('Stats de profil calculées', { action: userId });
            return computeStats(players as GamePlayerRecord[], userId, user.username, user.avatar, user.createdAt);
        } catch (error) {
            logger.error('Erreur lors du calcul des stats de profil', { error: error as Error });
            throw error;
        }
    },

    updateAvatar: async (userId: string, avatar: string): Promise<{ id: string; username: string; avatar: string }> => {
        if (!VALID_AVATARS.includes(avatar)) {
            logger.warn('Avatar invalide refusé', { action: avatar });
            throw new Error(`Avatar invalide : "${avatar}". Avatars autorisés : ${VALID_AVATARS.join(', ')}`);
        }

        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.update({
                where: { id: userId },
                data: { avatar },
            });

            logger.info('Avatar mis à jour', { action: `${userId} → ${avatar}` });
            return user;
        } catch (error) {
            logger.error('Erreur lors de la mise à jour de l\'avatar', { error: error as Error });
            throw error;
        }
    },
};

export default ProfileService;
