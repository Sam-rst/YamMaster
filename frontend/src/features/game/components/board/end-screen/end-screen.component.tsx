// frontend/src/features/game/components/board/end-screen/end-screen.component.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

interface EndScreenProps {
    isWin: boolean;
    isDraw: boolean;
    playerScore: number;
    opponentScore: number;
    reason: string;
    opponentName?: string;
    onReplay: () => void;
    onHome: () => void;
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const REASON_LABELS: Record<string, string> = {
    alignment5: 'Alignement de 5 pions',
    noTokens: 'Plus de pions disponibles',
};

type GameOutcome = 'draw' | 'win' | 'loss';

const OUTCOME_ACCENT_COLOR: Record<GameOutcome, string> = {
    draw: colors.gold,
    win: colors.gold,
    loss: colors.primary,
};

const OUTCOME_ICON: Record<GameOutcome, keyof typeof Feather.glyphMap> = {
    draw: 'minus-circle',
    win: 'award',
    loss: 'x-circle',
};

const OUTCOME_TITLE: Record<GameOutcome, string> = {
    draw: 'Égalité !',
    win: 'Victoire !',
    loss: 'Défaite',
};

const OUTCOME_SUBTITLE: Record<GameOutcome, string> = {
    draw: 'Match serré !',
    win: 'Vous êtes le maître du Yam',
    loss: 'Continuez à vous entraîner',
};

const OUTCOME_ICON_COLOR: Record<GameOutcome, string> = {
    draw: colors.background,
    win: colors.background,
    loss: colors.white,
};

function resolveOutcome(isWin: boolean, isDraw: boolean): GameOutcome {
    if (isDraw) return 'draw';
    if (isWin) return 'win';
    return 'loss';
}

const EndScreen: React.FC<EndScreenProps> = ({
    isWin,
    isDraw,
    playerScore,
    opponentScore,
    reason,
    opponentName = 'Adversaire',
    onReplay,
    onHome,
}) => {
    const outcome = resolveOutcome(isWin, isDraw);
    const accentColor = OUTCOME_ACCENT_COLOR[outcome];
    const iconName = OUTCOME_ICON[outcome];
    const title = OUTCOME_TITLE[outcome];
    const subtitle = OUTCOME_SUBTITLE[outcome];
    const iconColor = OUTCOME_ICON_COLOR[outcome];
    const isAlignment = reason === 'alignment5';

    return (
        <View style={styles.container}>
            <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
                <Feather name={iconName} size={56} color={iconColor} />
            </View>

            <View style={styles.titleSection}>
                <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {isAlignment ? (
                <View style={styles.alignmentCard}>
                    <Feather name="target" size={20} color={accentColor} />
                    <Text style={[styles.alignmentText, { color: accentColor }]}>
                        Alignement de 5 pions
                    </Text>
                </View>
            ) : (
                <View style={styles.scoreSection}>
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>Vous</Text>
                        <Text style={[styles.scoreValue, isWin && styles.scoreWin]}>{playerScore}</Text>
                    </View>
                    <Text style={styles.scoreDash}>—</Text>
                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>{opponentName}</Text>
                        <Text style={[styles.scoreValue, !isWin && !isDraw && styles.scoreLose]}>{opponentScore}</Text>
                    </View>
                </View>
            )}

            {!isAlignment && (
                <View style={styles.reasonCard}>
                    <Feather name="info" size={14} color={colors.textSecondary} />
                    <Text style={styles.reasonText}>{REASON_LABELS[reason] || reason}</Text>
                </View>
            )}

            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[styles.replayButton, { backgroundColor: accentColor }]}
                    onPress={onReplay}
                    activeOpacity={0.85}
                >
                    <Feather name="rotate-ccw" size={20} color={iconColor} />
                    <Text style={[styles.replayButtonText, { color: iconColor }]}>
                        Rejouer
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={onHome}
                    activeOpacity={0.7}
                >
                    <Feather name="home" size={20} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.homeButtonText}>Menu Principal</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 32,
        gap: 6,
    },
    title: {
        fontFamily: fontDisplay,
        fontSize: 42,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    subtitle: {
        fontFamily: fontSans,
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    scoreSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    scoreCard: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 28,
        alignItems: 'center',
        gap: 4,
    },
    scoreLabel: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    scoreValue: {
        fontFamily: fontDisplay,
        fontSize: 36,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    scoreWin: {
        color: colors.gold,
    },
    scoreLose: {
        color: colors.primary,
    },
    scoreDash: {
        fontFamily: fontDisplay,
        fontSize: 24,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.2)',
    },
    alignmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    alignmentText: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    reasonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    reasonText: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
    },
    buttons: {
        width: '100%',
        maxWidth: 320,
        gap: 12,
    },
    replayButton: {
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    replayButtonText: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    homeButton: {
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    homeButtonText: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
});

export default EndScreen;
