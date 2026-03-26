// frontend/src/features/history/services/history.service.ts

import { SERVER_URL } from '@/shared/services/config';

const HISTORY_API_URL = `${SERVER_URL}/api/history`;

interface GameSummary {
    id: string;
    mode: string;
    status: string;
    player1Score: number;
    player2Score: number;
    player1: { id: string; username: string } | null;
    player2: { id: string; username: string } | null;
    winner: { id: string; username: string } | null;
    createdAt: string;
}

interface GameDetail extends GameSummary {
    turns: unknown[] | null;
    reason: string | null;
    endedAt: string | null;
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
