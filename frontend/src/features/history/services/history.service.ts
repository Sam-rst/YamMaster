// frontend/src/features/history/services/history.service.ts

import { SERVER_URL } from '@/shared/services/config';

const HISTORY_API_URL = `${SERVER_URL}/api/history`;

export interface GameSummary {
    id: string;
    mode: string;
    status: string;
    reason: string | null;
    reasonLabel: string | null;
    myScore: number;
    opponentScore: number;
    scoreDisplay: string;
    myResult: string;
    opponentName: string;
    createdAt: string;
    endedAt: string | null;
    myTokensLeft: number;
}

export interface GameDetail extends GameSummary {
    turns: unknown[] | null;
}

const HistoryService = {
    getGamesByUserId: async (userId: string): Promise<GameSummary[]> => {
        try {
            const response = await fetch(`${HISTORY_API_URL}/user/${userId}`);
            return await response.json();
        } catch {
            return [];
        }
    },

    getGameById: async (gameId: string): Promise<GameDetail | null> => {
        try {
            const response = await fetch(`${HISTORY_API_URL}/game/${gameId}`);
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    },
};

export default HistoryService;
