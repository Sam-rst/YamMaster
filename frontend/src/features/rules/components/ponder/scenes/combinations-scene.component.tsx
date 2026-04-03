import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const DOT_POSITIONS: boolean[][] = [
    [false, false, false, false, true,  false, false, false, false], // 1
    [true,  false, false, false, false, false, false, false, true],  // 2
    [true,  false, false, false, true,  false, false, false, true],  // 3
    [true,  false, true,  false, false, false, true,  false, true],  // 4
    [true,  false, true,  false, true,  false, true,  false, true],  // 5
    [true,  false, true,  true,  false, true,  true,  false, true],  // 6
];

interface DieProps {
    value: number;
    highlighted: boolean;
    goldBorder?: boolean;
}

const Die: React.FC<DieProps> = ({ value, highlighted, goldBorder }) => {
    const dots = (value >= 1 && value <= 6) ? DOT_POSITIONS[value - 1] : [];

    return (
        <View style={[
            styles.die,
            !highlighted && styles.dieDimmed,
            goldBorder && styles.dieGoldBorder,
        ]}>
            <View style={styles.dotsGrid}>
                {dots.map((hasDot, i) => (
                    <View key={`dot-${i}`} style={styles.dotSlot}>
                        {hasDot && <View style={styles.dot} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

interface StepConfig {
    name: string;
    description: string;
    dice: { value: number; highlighted: boolean; goldBorder?: boolean }[];
    sumLabel?: string;
}

const STEPS: StepConfig[] = [
    {
        name: 'Brelan',
        description: '3 dés identiques sur les 5 lancés.',
        dice: [
            { value: 3, highlighted: true },
            { value: 3, highlighted: true },
            { value: 3, highlighted: true },
            { value: 1, highlighted: false },
            { value: 5, highlighted: false },
        ],
    },
    {
        name: 'Full',
        description: 'Un Brelan + une paire — tous les dés comptent.',
        dice: [
            { value: 2, highlighted: true },
            { value: 2, highlighted: true },
            { value: 2, highlighted: true },
            { value: 4, highlighted: true },
            { value: 4, highlighted: true },
        ],
    },
    {
        name: 'Carré',
        description: '4 dés identiques parmi les 5.',
        dice: [
            { value: 6, highlighted: true },
            { value: 6, highlighted: true },
            { value: 6, highlighted: true },
            { value: 6, highlighted: true },
            { value: 2, highlighted: false },
        ],
    },
    {
        name: 'Yam',
        description: '5 dés identiques — la combinaison suprême !',
        dice: [
            { value: 1, highlighted: true, goldBorder: true },
            { value: 1, highlighted: true, goldBorder: true },
            { value: 1, highlighted: true, goldBorder: true },
            { value: 1, highlighted: true, goldBorder: true },
            { value: 1, highlighted: true, goldBorder: true },
        ],
    },
    {
        name: 'Suite',
        description: '5 dés consécutifs : 1-2-3-4-5.',
        dice: [
            { value: 1, highlighted: true },
            { value: 2, highlighted: true },
            { value: 3, highlighted: true },
            { value: 4, highlighted: true },
            { value: 5, highlighted: true },
        ],
    },
    {
        name: '≤8',
        description: 'La somme des 5 dés est inférieure ou égale à 8.',
        dice: [
            { value: 1, highlighted: true },
            { value: 1, highlighted: true },
            { value: 2, highlighted: true },
            { value: 2, highlighted: true },
            { value: 1, highlighted: true },
        ],
        sumLabel: '= 7 ≤ 8',
    },
];

interface CombinationsSceneProps {
    currentStep: number;
}

const CombinationsScene: React.FC<CombinationsSceneProps> = ({ currentStep }) => {
    const step = STEPS[currentStep] ?? STEPS[0];

    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{step.name}</Text>
            </View>

            <Text style={styles.description}>{step.description}</Text>

            <View style={styles.diceRow}>
                {step.dice.map((die, i) => (
                    <Die
                        key={`die-${i}-${die.value}`}
                        value={die.value}
                        highlighted={die.highlighted}
                        goldBorder={die.goldBorder}
                    />
                ))}
            </View>

            {step.sumLabel !== undefined && (
                <View style={styles.sumBadge}>
                    <Text style={styles.sumText}>{step.sumLabel}</Text>
                </View>
            )}
        </View>
    );
};

export default CombinationsScene;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    badge: {
        borderWidth: 1,
        borderColor: colors.gold,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    badgeText: {
        fontFamily: fontSans,
        fontSize: 16,
        fontWeight: '700',
        color: colors.gold,
    },
    description: {
        fontFamily: fontSans,
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    diceRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginVertical: 8,
    },
    die: {
        width: 48,
        height: 48,
        backgroundColor: colors.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
    },
    dieGoldBorder: {
        borderWidth: 3,
        borderColor: colors.gold,
    },
    dieDimmed: {
        opacity: 0.4,
    },
    dotsGrid: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dotSlot: {
        width: '33.33%',
        height: '33.33%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.background,
    },
    sumBadge: {
        borderWidth: 1,
        borderColor: colors.blue,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    sumText: {
        fontFamily: fontSans,
        fontSize: 13,
        fontWeight: '700',
        color: colors.blue,
    },
});
