// frontend/src/features/profile/services/profile.service.ts
// Service frontend pour la gestion des profils joueurs

import { SERVER_URL } from '@/shared/services/config';

const PROFILE_API_URL = `${SERVER_URL}/api/profile`;

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

const ProfileService = {
    getProfile: async (userId: string): Promise<ProfileStats | null> => {
        try {
            const response = await fetch(`${PROFILE_API_URL}/${userId}`);
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    },

    updateAvatar: async (userId: string, avatar: string): Promise<boolean> => {
        try {
            const response = await fetch(`${PROFILE_API_URL}/${userId}/avatar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar }),
            });
            return response.ok;
        } catch {
            return false;
        }
    },
};

export default ProfileService;
