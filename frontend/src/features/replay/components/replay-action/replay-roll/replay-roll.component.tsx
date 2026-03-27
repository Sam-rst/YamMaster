// frontend/src/features/replay/components/replay-action/replay-roll/replay-roll.component.tsx

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';
import Dice from '@/features/game/components/board/dice/die.component';

interface DiceData {
    id: number;
    value: string;
}

interface ReplayRollProps {
    data: {
        dices: DiceData[];
        rollNumber: number;
    };
}

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const ReplayRoll: React.FC<ReplayRollProps> = ({ data }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Lancer {data.rollNumber}/3</Text>
            <View style={styles.diceRow}>
                {data.dices.map((die) => (
                    <View key={die.id} testID={`replay-die-${die.id}`}>
                        <Dice value={die.value} locked={false} />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 10,
    },
    label: {
        fontFamily: fontSans,
        fontSize: 13,
        fontWeight: '700',
        color: colors.blue,
    },
    diceRow: {
        flexDirection: 'row',
        gap: 8,
    },
});

export default ReplayRoll;
