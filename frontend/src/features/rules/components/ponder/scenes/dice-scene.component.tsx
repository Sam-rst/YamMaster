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
    locked: boolean;
    dimmed: boolean;
}

const Die: React.FC<DieProps> = ({ value, locked, dimmed }) => {
    const dots = (value >= 1 && value <= 6) ? DOT_POSITIONS[value - 1] : [];

    return (
        <View style={[
            styles.die,
            locked && styles.dieLockedBorder,
            dimmed && styles.dieDimmed,
        ]}>
            <View style={styles.dotsGrid}>
                {dots.map((hasDot, i) => (
                    <View key={i} style={styles.dotSlot}>
                        {hasDot && <View style={styles.dot} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

interface StepConfig {
    label: string;
    description: string;
    dice: { value: number; locked: boolean; highlighted: boolean }[];
    badge?: string;
}

const STEPS: StepConfig[] = [
    {
        label: 'Premier lancer',
        description: 'Lancez les 5 dés pour commencer votre tour.',
        dice: [
            { value: 3, locked: false, highlighted: true },
            { value: 5, locked: false, highlighted: true },
            { value: 5, locked: false, highlighted: true },
            { value: 2, locked: false, highlighted: true },
            { value: 6, locked: false, highlighted: true },
        ],
    },
    {
        label: 'Verrouiller les dés',
        description: 'Gardez les dés que vous voulez conserver.',
        dice: [
            { value: 3, locked: false, highlighted: false },
            { value: 5, locked: true,  highlighted: true  },
            { value: 5, locked: true,  highlighted: true  },
            { value: 2, locked: false, highlighted: false },
            { value: 6, locked: false, highlighted: false },
        ],
    },
    {
        label: 'Deuxième lancer',
        description: 'Relancez les dés non verrouillés.',
        dice: [
            { value: 4, locked: false, highlighted: true  },
            { value: 5, locked: true,  highlighted: false },
            { value: 5, locked: true,  highlighted: false },
            { value: 5, locked: false, highlighted: true  },
            { value: 1, locked: false, highlighted: true  },
        ],
    },
    {
        label: 'Verrouiller encore',
        description: 'Verrouillez le nouveau 5 obtenu.',
        dice: [
            { value: 4, locked: false, highlighted: false },
            { value: 5, locked: true,  highlighted: true  },
            { value: 5, locked: true,  highlighted: true  },
            { value: 5, locked: true,  highlighted: true  },
            { value: 1, locked: false, highlighted: false },
        ],
    },
    {
        label: 'Dernier lancer',
        description: 'Dernier lancer — résultat final.',
        dice: [
            { value: 5, locked: true,  highlighted: true  },
            { value: 5, locked: true,  highlighted: true  },
            { value: 5, locked: true,  highlighted: true  },
            { value: 5, locked: false, highlighted: true  },
            { value: 3, locked: false, highlighted: false },
        ],
        badge: 'Carré !',
    },
];

interface DiceSceneProps {
    currentStep: number;
}

const DiceScene: React.FC<DiceSceneProps> = ({ currentStep }) => {
    const step = STEPS[currentStep] ?? STEPS[0];

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{step.label}</Text>
            <Text style={styles.description}>{step.description}</Text>

            <View style={styles.diceRow}>
                {step.dice.map((die, i) => (
                    <Die
                        key={i}
                        value={die.value}
                        locked={die.locked}
                        dimmed={!die.highlighted}
                    />
                ))}
            </View>

            {step.badge !== undefined && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{step.badge}</Text>
                </View>
            )}
        </View>
    );
};

export default DiceScene;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    label: {
        fontFamily: fontSans,
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
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
    dieLockedBorder: {
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
    badge: {
        borderWidth: 1,
        borderColor: colors.gold,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    badgeText: {
        fontFamily: fontSans,
        fontSize: 13,
        fontWeight: '700',
        color: colors.gold,
    },
});
