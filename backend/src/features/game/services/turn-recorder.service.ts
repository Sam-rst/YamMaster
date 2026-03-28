// backend/src/features/game/services/turn-recorder.service.ts
// Service d'enregistrement des tours pour le replay

interface TurnAction {
    type: 'roll' | 'lock' | 'choice' | 'grid' | 'defi' | 'predator' | 'snapshot';
    playerNumber: number;
    timestamp: number;
    data: Record<string, unknown>;
}

interface TurnRecorder {
    recordAction: (action: Omit<TurnAction, 'timestamp'>) => void;
    recordGameState: (state: Record<string, unknown>) => void;
    getTurns: () => TurnAction[];
    toJSON: () => TurnAction[];
}

const TurnRecorderService = {
    createRecorder: (): TurnRecorder => {
        const turns: TurnAction[] = [];

        return {
            recordAction: (action) => {
                turns.push({
                    ...action,
                    timestamp: Date.now(),
                });
            },

            recordGameState: (state) => {
                turns.push({
                    type: 'snapshot',
                    playerNumber: 0,
                    timestamp: Date.now(),
                    data: state,
                });
            },

            getTurns: () => turns,

            toJSON: () => [...turns],
        };
    },
};

export default TurnRecorderService;
export type { TurnAction, TurnRecorder };
