// frontend/src/features/game/components/board/dice/die.component.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

interface DiceProps {
    index?: number;
    locked: boolean;
    value: string;
    onPress?: (index: number) => void;
    opponent?: boolean;
}

const SLOT_IDS = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'] as const;

interface DotSlot {
    id: string;
    hasDot: boolean;
}

const DOT_POSITIONS_RAW: boolean[][] = [
    [false, false, false, false, true, false, false, false, false],  // 1
    [true, false, false, false, false, false, false, false, true],   // 2
    [true, false, false, false, true, false, false, false, true],    // 3
    [true, false, true, false, false, false, true, false, true],     // 4
    [true, false, true, false, true, false, true, false, true],      // 5
    [true, false, true, true, false, true, true, false, true],       // 6
];

const DOT_POSITIONS: DotSlot[][] = DOT_POSITIONS_RAW.map((row) =>
    row.map((hasDot, i) => ({ id: SLOT_IDS[i], hasDot }))
);

const Dice: React.FC<DiceProps> = ({ index, locked, value, onPress, opponent }) => {
    const handlePress = (): void => {
        if (!opponent && onPress && index !== undefined) {
            onPress(index);
        }
    };

    const numValue = Number.parseInt(value, 10);
    const dots: DotSlot[] = (numValue >= 1 && numValue <= 6) ? DOT_POSITIONS[numValue - 1] : [];
    const isSmall = !!opponent;
    const dotSize = isSmall ? 4 : 6;

    return (
        <TouchableOpacity
            style={[
                styles.dice,
                isSmall && styles.smallDice,
                locked && styles.lockedDice,
            ]}
            onPress={handlePress}
            disabled={opponent}
            activeOpacity={opponent ? 1 : 0.7}
        >
            <View style={[styles.dotsGrid, isSmall && styles.smallDotsGrid]}>
                {dots.map((slot) => (
                    <View key={`dot-${slot.id}`} style={styles.dotSlot}>
                        {slot.hasDot && (
                            <View style={[
                                styles.dot,
                                { width: dotSize, height: dotSize, borderRadius: dotSize / 2 },
                                locked && styles.lockedDot,
                                isSmall && styles.smallDot,
                            ]} />
                        )}
                    </View>
                ))}
            </View>

            {locked && (
                <View style={styles.lockBadge}>
                    <Feather name="lock" size={8} color={colors.background} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    dice: {
        width: 52,
        height: 52,
        backgroundColor: colors.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    smallDice: {
        width: 36,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 6,
    },
    lockedDice: {
        borderWidth: 3,
        borderColor: colors.gold,
    },
    dotsGrid: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    smallDotsGrid: {
        width: '100%',
        height: '100%',
    },
    dotSlot: {
        width: '33.33%',
        height: '33.33%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        backgroundColor: colors.background,
    },
    lockedDot: {
        backgroundColor: colors.background,
    },
    smallDot: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    lockBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.gold,
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Dice;
