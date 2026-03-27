// frontend/src/features/replay/controllers/replay.controller.tsx
// Gère le chargement, la navigation entre les tours, et délègue l'affichage à ReplayAction

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import ReplayService, { GameWithTurns, TurnAction } from '../services/replay.service';
import ReplayAction from '../components/replay-action/replay-action.component';

interface NavigationProp {
    navigate: (screen: string) => void;
}

interface ReplayControllerProps {
    navigation: NavigationProp;
    gameId: string;
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const ReplayController: React.FC<ReplayControllerProps> = ({ navigation, gameId }) => {
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
                    style={styles.errorButton}
                    onPress={() => navigation.navigate('HistoryScreen')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.errorButtonText}>Retour à l&apos;historique</Text>
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

            {currentTurn ? (
                <ReplayAction
                    type={currentTurn.type}
                    data={currentTurn.data as Record<string, unknown>}
                    playerName={getPlayerName(currentTurn.playerNumber)}
                />
            ) : (
                <View style={styles.startCard}>
                    <Feather name="play-circle" size={28} color={colors.textSecondary} />
                    <Text style={styles.startText}>Début de la partie</Text>
                    <Text style={styles.startSubtext}>
                        Utilisez les contrôles pour naviguer tour par tour
                    </Text>
                </View>
            )}

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
    scrollView: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 24, paddingTop: 48 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24, gap: 16 },
    errorText: { fontFamily: fontSans, fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
    errorButton: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
    errorButtonText: { fontFamily: fontDisplay, fontSize: 14, fontWeight: '700', color: colors.white, textTransform: 'uppercase', letterSpacing: 2 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontFamily: fontDisplay, fontSize: 24, fontWeight: '700', fontStyle: 'italic', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: -0.5 },
    stepSection: { alignItems: 'center', marginBottom: 24, gap: 8 },
    stepLabel: { fontFamily: fontSans, fontSize: 10, fontWeight: '900', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 4 },
    stepCounterRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    stepCurrent: { fontFamily: fontDisplay, fontSize: 42, fontWeight: '900', color: colors.primary },
    stepSeparator: { fontFamily: fontDisplay, fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.2)' },
    stepTotal: { fontFamily: fontDisplay, fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.3)' },
    progressBar: { width: '100%', maxWidth: 200, height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
    startCard: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8, marginBottom: 24 },
    startText: { fontFamily: fontDisplay, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    startSubtext: { fontFamily: fontSans, fontSize: 12, color: colors.textSecondary },
    controls: { flexDirection: 'row', gap: 12, marginTop: 24 },
    controlButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: 12 },
    controlButtonPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
    controlDisabled: { opacity: 0.4 },
    controlText: { fontFamily: fontDisplay, fontSize: 14, fontWeight: '700', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 },
    controlTextPrimary: { color: colors.white },
    controlTextDisabled: { color: 'rgba(255,255,255,0.2)' },
});

export default ReplayController;
