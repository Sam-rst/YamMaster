// frontend/src/features/game/components/board/dice/die.component.tsx

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

interface DiceProps {
    index?: number;
    locked: boolean;
    value: string;
    onPress?: (index: number) => void;
    opponent?: boolean;
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

const Dice: React.FC<DiceProps> = ({ index, locked, value, onPress, opponent }) => {
    const handlePress = (): void => {
        if (!opponent && onPress && index !== undefined) {
            onPress(index);
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.dice,
                locked && styles.lockedDice,
                opponent && styles.opponentDice,
            ]}
            onPress={handlePress}
            disabled={opponent}
            activeOpacity={opponent ? 1 : 0.7}
        >
            <Text style={[
                styles.diceText,
                locked && styles.lockedText,
                opponent && styles.opponentText,
            ]}>
                {value}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    dice: {
        width: 52,
        height: 52,
        backgroundColor: colors.white,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedDice: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    opponentDice: {
        width: 36,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    diceText: {
        fontFamily: fontDisplay,
        fontSize: 22,
        fontWeight: '900',
        color: colors.background,
    },
    lockedText: {
        color: colors.primary,
    },
    opponentText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.4)',
    },
});

export default Dice;
