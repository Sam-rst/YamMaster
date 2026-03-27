// frontend/src/features/replay/components/replay-board/replay-scores/replay-scores.component.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import { scoreTextStyles } from '@/shared/theme/game-styles';
import { fontDisplay, fontSans } from '@/shared/theme/fonts';

interface ReplayScoresProps {
    player1Score: number;
    player2Score: number;
    player1Tokens: number;
    player2Tokens: number;
    currentTurn: string;
}

const ReplayScores: React.FC<ReplayScoresProps> = ({
    player1Score,
    player2Score,
    player1Tokens,
    player2Tokens,
    currentTurn,
}) => {
    const isPlayer1Active = currentTurn === 'player:1';
    const isPlayer2Active = currentTurn === 'player:2';

    return (
        <View style={styles.container}>
            <View style={[styles.playerColumn, isPlayer1Active && styles.activeColumn]}>
                <Text style={scoreTextStyles.label}>J1</Text>
                <Text style={[scoreTextStyles.value, isPlayer1Active && styles.activeScore]}>
                    {player1Score}
                </Text>
                <View style={styles.tokenRow}>
                    <Feather name="disc" size={12} color={colors.gold} />
                    <Text style={styles.tokenText}>{player1Tokens}</Text>
                </View>
            </View>

            <Text style={styles.versus}>VS</Text>

            <View style={[styles.playerColumn, isPlayer2Active && styles.activeColumn]}>
                <Text style={scoreTextStyles.label}>J2</Text>
                <Text style={[scoreTextStyles.value, isPlayer2Active && styles.activeScore]}>
                    {player2Score}
                </Text>
                <View style={styles.tokenRow}>
                    <Feather name="disc" size={12} color={colors.gold} />
                    <Text style={styles.tokenText}>{player2Tokens}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    playerColumn: {
        alignItems: 'center',
        backgroundColor: colors.glass,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 10,
        paddingHorizontal: 20,
        gap: 4,
        flex: 1,
    },
    activeColumn: {
        borderColor: colors.playerToken,
        backgroundColor: 'rgba(233, 69, 96, 0.08)',
    },
    activeScore: {
        color: colors.playerToken,
    },
    versus: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    tokenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    tokenText: {
        fontFamily: fontSans,
        fontSize: 12,
        fontWeight: '600',
        color: colors.gold,
    },
});

export default ReplayScores;
