// frontend/src/features/replay/components/replay-board/replay-board.component.tsx
// Orchestrateur du plateau de replay — assemble les sous-composants visuels

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/shared/theme/colors';
import ReplayActionInfo from './replay-action-info/replay-action-info.component';
import ReplayScores from './replay-scores/replay-scores.component';
import ReplayGrid from './replay-grid/replay-grid.component';
import ReplayDice from './replay-dice/replay-dice.component';

interface GridCell {
    id: string;
    viewContent: string;
    owner: string | null;
    canBeChecked: boolean;
}

interface DiceData {
    id: number;
    value: string;
    locked: boolean;
}

interface ReplayAction {
    type: string;
    playerNumber: number;
    timestamp: number;
    data: Record<string, unknown>;
}

interface GameState {
    currentTurn: string;
    timer: number;
    player1Score: number;
    player2Score: number;
    player1Tokens: number;
    player2Tokens: number;
    grid: GridCell[][];
    choices: {
        isDefi: boolean;
        isSec: boolean;
        idSelectedChoice: string | null;
        availableChoices: unknown[];
    };
    deck: {
        dices: DiceData[];
        rollsCounter: number;
        rollsMaximum: number;
    };
}

interface ReplayBoardProps {
    gameState: GameState;
    action: ReplayAction | null;
    playerName: string;
    player1Name?: string;
    player2Name?: string;
}

const ReplayBoard: React.FC<ReplayBoardProps> = ({ gameState, action, playerName, player1Name, player2Name }) => {
    return (
        <View style={styles.container}>
            <ReplayActionInfo action={action} playerName={playerName} />
            <ReplayScores
                player1Score={gameState.player1Score}
                player2Score={gameState.player2Score}
                player1Tokens={gameState.player1Tokens}
                player2Tokens={gameState.player2Tokens}
                currentTurn={gameState.currentTurn}
                player1Name={player1Name}
                player2Name={player2Name}
            />
            <ReplayGrid grid={gameState.grid} />
            <ReplayDice
                dices={gameState.deck.dices}
                rollsCounter={gameState.deck.rollsCounter}
                rollsMaximum={gameState.deck.rollsMaximum}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
    },
});

export default ReplayBoard;
