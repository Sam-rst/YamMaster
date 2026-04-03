import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const SLOT_IDS = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'] as const;

const DOT_POSITIONS = [
    [false, false, false, false, true,  false, false, false, false], // 1
    [true,  false, false, false, false, false, false, false, true],  // 2
    [true,  false, false, false, true,  false, false, false, true],  // 3
    [true,  false, true,  false, false, false, true,  false, true],  // 4
    [true,  false, true,  false, true,  false, true,  false, true],  // 5
    [true,  false, true,  true,  false, true,  true,  false, true],  // 6
].map(row => row.map((hasDot, idx) => ({ id: SLOT_IDS[idx], hasDot })));

interface DieProps {
    value: number;
}

const Die: React.FC<DieProps> = ({ value }) => {
    const dots = (value >= 1 && value <= 6) ? DOT_POSITIONS[value - 1] : [];

    return (
        <View style={styles.die}>
            <View style={styles.dotsGrid}>
                {dots.map((hasDot) => (
                    <View key={hasDot.id} style={styles.dotSlot}>
                        {hasDot.hasDot && <View style={styles.dot} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

const SecStep: React.FC = () => (
    <View style={styles.container}>
        <View style={[styles.badge, styles.badgeGold]}>
            <Text style={[styles.badgeText, styles.badgeTextGold]}>SEC !</Text>
        </View>
        <Text style={styles.description}>
            Réussir une combinaison dès le 1er lancer — bonus immédiat !
        </Text>
        <View style={styles.diceRow}>
            <Die value={2} />
            <Die value={2} />
            <Die value={2} />
            <Die value={4} />
            <Die value={4} />
        </View>
        <Text style={styles.hint}>Combinaison obtenue au premier lancer sans relancer.</Text>
    </View>
);

const DefiStep: React.FC = () => (
    <View style={styles.container}>
        <View style={[styles.badge, styles.badgeCoral]}>
            <Text style={[styles.badgeText, styles.badgeTextCoral]}>DÉFI</Text>
        </View>
        <Text style={styles.description}>
            Lancez un défi à votre adversaire : il doit réussir la même combinaison.
        </Text>
        <View style={styles.diceRow}>
            <Die value={3} />
            <Die value={3} />
            <Die value={3} />
            <Die value={5} />
            <Die value={5} />
        </View>
        <Text style={styles.hint}>S'il échoue, vous marquez des points supplémentaires.</Text>
    </View>
);

const YamPredatorStep: React.FC = () => (
    <View style={styles.container}>
        <View style={[styles.badge, styles.badgeRed]}>
            <Text style={[styles.badgeText, styles.badgeTextRed]}>YAM PREDATOR</Text>
        </View>
        <Text style={styles.description}>
            Réussir un Yam sur une case déjà occupée par l'adversaire.
        </Text>
        <View style={styles.diceRow}>
            <Die value={4} />
            <Die value={4} />
            <Die value={4} />
            <Die value={4} />
            <Die value={4} />
        </View>
        <View style={styles.miniCell}>
            <Text style={styles.miniCellText}>✕</Text>
        </View>
    </View>
);

const STEPS = [SecStep, DefiStep, YamPredatorStep];

interface SpecialSceneProps {
    currentStep: number;
}

const SpecialScene: React.FC<SpecialSceneProps> = ({ currentStep }) => {
    const StepComponent = STEPS[currentStep] ?? STEPS[0];
    return <StepComponent />;
};

export default SpecialScene;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    badge: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    badgeGold: {
        borderColor: colors.gold,
    },
    badgeCoral: {
        borderColor: colors.primary,
    },
    badgeRed: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(233, 69, 96, 0.15)',
    },
    badgeText: {
        fontFamily: fontSans,
        fontSize: 16,
        fontWeight: '700',
    },
    badgeTextGold: {
        color: colors.gold,
    },
    badgeTextCoral: {
        color: colors.primary,
    },
    badgeTextRed: {
        color: colors.primary,
    },
    description: {
        fontFamily: fontSans,
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    hint: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 16,
        opacity: 0.7,
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
    miniCell: {
        width: 36,
        height: 36,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniCellText: {
        fontFamily: fontSans,
        fontSize: 16,
        fontWeight: '700',
        color: colors.blue,
    },
});
