// frontend/src/features/replay/screens/replay.screen.tsx
// Zéro logique métier — affiche les tours envoyés par le backend

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import ReplayService, { GameWithTurns, TurnAction } from '../services/replay.service';

interface NavigationProp {
    navigate: (screen: string) => void;
}

interface Props {
    navigation: NavigationProp;
    route: { params: { gameId: string } };
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const ACTION_LABELS: Record<string, string> = {
    roll: 'Lancer de dés',
    lock: 'Verrouillage dé',
    choice: 'Choix combinaison',
    grid: 'Placement pion',
    defi: 'Défi activé',
    predator: 'Yam Predator',
    snapshot: 'État du jeu',
};

const ACTION_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
    roll: 'rotate-cw',
    lock: 'lock',
    choice: 'check-square',
    grid: 'grid',
    defi: 'shield',
    predator: 'zap',
    snapshot: 'camera',
};

const ACTION_COLORS: Record<string, string> = {
    roll: colors.blue,
    lock: colors.gold,
    choice: colors.success,
    grid: colors.primary,
    defi: colors.gold,
    predator: colors.primary,
    snapshot: 'rgba(255,255,255,0.4)',
};

const ReplayScreen: React.FC<Props> = ({ navigation, route }) => {
    const { gameId } = route.params;

    const [game, setGame] = useState<GameWithTurns | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const loadGame = async (): Promise<void> => {
            const result = await ReplayService.getGameWithTurns(gameId);
            setGame(result);
            setLoading(false);
        };
        loadGame();
    }, [gameId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!game || !game.turns) {
        return (
            <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={40} color="rgba(255,255,255,0.2)" />
                <Text style={styles.errorText}>Partie introuvable ou pas de données de replay</Text>
                <TouchableOpacity
                    style={styles.backButtonLarge}
                    onPress={() => navigation.navigate('HistoryScreen')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backButtonLargeText}>Retour à l&apos;historique</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const turns = game.turns;
    const totalSteps = turns.length;
    const currentTurn: TurnAction | null = currentStep > 0 ? turns[currentStep - 1] : null;

    const getPlayerName = (playerNumber: number): string => {
        const player = game.players.find(p => p.playerNumber === playerNumber);
        if (!player) return `Joueur ${playerNumber}`;
        if (player.isBot) return 'Bot';
        return player.user?.username || `Joueur ${playerNumber}`;
    };

    const goNext = (): void => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const goPrev = (): void => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const actionType = currentTurn?.type || 'snapshot';
    const actionColor = ACTION_COLORS[actionType] || 'rgba(255,255,255,0.4)';
    const actionIcon = ACTION_ICONS[actionType] || 'info';

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('HistoryScreen')}
                    activeOpacity={0.7}
                >
                    <Feather name="chevron-left" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Replay</Text>
            </View>

            <View style={styles.stepSection}>
                <Text style={styles.stepLabel}>Tour</Text>
                <View style={styles.stepCounterRow}>
                    <Text style={styles.stepCurrent}>{currentStep}</Text>
                    <Text style={styles.stepSeparator}>/</Text>
                    <Text style={styles.stepTotal}>{totalSteps}</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill,
                        { width: totalSteps > 0 ? `${(currentStep / totalSteps) * 100}%` : '0%' },
                    ]} />
                </View>
            </View>

            <View style={styles.actionCard}>
                <View style={[styles.actionIconBox, { backgroundColor: `${actionColor}15` }]}>
                    <Feather name={actionIcon} size={22} color={actionColor} />
                </View>

                <View style={styles.actionContent}>
                    {currentTurn ? (
                        <>
                            <Text style={[styles.actionPlayerName, { color: actionColor }]}>
                                {getPlayerName(currentTurn.playerNumber)}
                            </Text>
                            <Text style={styles.actionTypeText}>
                                {ACTION_LABELS[currentTurn.type] || currentTurn.type}
                            </Text>
                            <View style={styles.actionDataBox}>
                                <Text style={styles.actionData}>
                                    {JSON.stringify(currentTurn.data, null, 2)}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.actionTypeText}>Début de la partie</Text>
                            <Text style={styles.actionSubtext}>
                                Utilisez les contrôles pour naviguer tour par tour
                            </Text>
                        </>
                    )}
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, currentStep === 0 && styles.controlDisabled]}
                    onPress={goPrev}
                    disabled={currentStep === 0}
                    activeOpacity={0.7}
                >
                    <Feather name="skip-back" size={18} color={currentStep === 0 ? 'rgba(255,255,255,0.2)' : colors.textPrimary} />
                    <Text style={[styles.controlText, currentStep === 0 && styles.controlTextDisabled]}>
                        Précédent
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.controlButtonPrimary, currentStep === totalSteps && styles.controlDisabled]}
                    onPress={goNext}
                    disabled={currentStep === totalSteps}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.controlText, styles.controlTextPrimary, currentStep === totalSteps && styles.controlTextDisabled]}>
                        Suivant
                    </Text>
                    <Feather name="skip-forward" size={18} color={currentStep === totalSteps ? 'rgba(255,255,255,0.2)' : colors.white} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 48,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 24,
        gap: 16,
    },
    errorText: {
        fontFamily: fontSans,
        fontSize: 14,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
    },
    backButtonLarge: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    backButtonLargeText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: fontDisplay,
        fontSize: 24,
        fontWeight: '700',
        fontStyle: 'italic',
        color: colors.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },

    stepSection: {
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    stepLabel: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '900',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 4,
    },
    stepCounterRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    stepCurrent: {
        fontFamily: fontDisplay,
        fontSize: 42,
        fontWeight: '900',
        color: colors.primary,
    },
    stepSeparator: {
        fontFamily: fontDisplay,
        fontSize: 24,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.2)',
    },
    stepTotal: {
        fontFamily: fontDisplay,
        fontSize: 24,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.3)',
    },
    progressBar: {
        width: '100%',
        maxWidth: 200,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    },

    actionCard: {
        flexDirection: 'row',
        gap: 14,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    actionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    actionContent: {
        flex: 1,
        gap: 4,
    },
    actionPlayerName: {
        fontFamily: fontDisplay,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    actionTypeText: {
        fontFamily: fontDisplay,
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    actionSubtext: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    actionDataBox: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
    },
    actionData: {
        fontFamily: Platform.select({ web: 'monospace', default: 'monospace' }),
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
    },

    controls: {
        flexDirection: 'row',
        gap: 12,
    },
    controlButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 14,
        borderRadius: 12,
    },
    controlButtonPrimary: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    controlDisabled: {
        opacity: 0.4,
    },
    controlText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    controlTextPrimary: {
        color: colors.white,
    },
    controlTextDisabled: {
        color: 'rgba(255,255,255,0.2)',
    },
});

export default ReplayScreen;
