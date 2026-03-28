// frontend/src/features/replay/services/replay.service.ts

import { SERVER_URL } from '@/shared/services/config';

const HISTORY_API_URL = `${SERVER_URL}/api/history`;

export interface TurnAction {
    type: string;
    playerNumber: number;
    timestamp: number;
    data: Record<string, unknown>;
}

export interface GamePlayer {
    playerNumber: number;
    user: { id: string; username: string } | null;
    isBot: boolean;
    score: number;
    result: string;
}

export interface GameWithTurns {
    id: string;
    mode: string;
    reason: string | null;
    turns: TurnAction[] | null;
    players: GamePlayer[];
}

const ReplayService = {
    getGameWithTurns: async (gameId: string): Promise<GameWithTurns | null> => {
        try {
            const response = await fetch(`${HISTORY_API_URL}/game/${gameId}`);
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    },
};

export default ReplayService;
