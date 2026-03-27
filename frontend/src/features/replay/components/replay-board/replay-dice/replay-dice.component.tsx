// frontend/src/features/replay/components/replay-board/replay-dice/replay-dice.component.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Dice from '@/features/game/components/board/dice/die.component';
import { colors } from '@/shared/theme/colors';
import { fontDisplay, fontSans } from '@/shared/theme/fonts';

interface DiceData {
    id: number;
    value: string;
    locked: boolean;
}

interface ReplayDiceProps {
    dices: DiceData[];
    rollsCounter?: number;
    rollsMaximum?: number;
}

const ReplayDice: React.FC<ReplayDiceProps> = ({ dices, rollsCounter, rollsMaximum }) => {
    return (
        <View style={styles.container}>
            <View style={styles.diceRow}>
                {dices.map((die) => (
                    <Dice
                        key={die.id}
                        index={die.id}
                        value={die.value}
                        locked={die.locked}
                    />
                ))}
            </View>
            {rollsCounter !== undefined && rollsMaximum !== undefined && (
                <Text style={styles.rollCounter}>
                    Lancer {rollsCounter} / {rollsMaximum}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8,
    },
    diceRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    rollCounter: {
        fontFamily: fontSans,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
});

export default ReplayDice;
