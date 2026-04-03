// frontend/src/features/replay/controllers/replay.controller.tsx
// Gère le chargement, la navigation entre les tours, l'autoplay, et délègue l'affichage à ReplayBoard

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import ReplayService, { GameWithTurns, TurnAction } from '../services/replay.service';
import ReplayBoard from '../components/replay-board/replay-board.component';
import ReplayActionInfo from '../components/replay-board/replay-action-info/replay-action-info.component';

interface NavigationProp {
    navigate: (screen: string) => void;
}

interface ReplayControllerProps {
    navigation: NavigationProp;
    gameId: string;
}

interface GameSnapshot {
    currentTurn: string;
    timer: number;
    player1Score: number;
    player2Score: number;
    player1Tokens: number;
    player2Tokens: number;
    grid: { id: string; viewContent: string; owner: string | null; canBeChecked: boolean }[][];
    choices: { isDefi: boolean; isSec: boolean; idSelectedChoice: string | null; availableChoices: unknown[] };
    deck: { dices: { id: number; value: string; locked: boolean }[]; rollsCounter: number; rollsMaximum: number };
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const AUTOPLAY_INTERVAL_MS = 1000;

const DEFAULT_GAME_STATE: GameSnapshot = {
    currentTurn: '',
    timer: 0,
    player1Score: 0,
    player2Score: 0,
    player1Tokens: 12,
    player2Tokens: 12,
    grid: [],
    choices: { isDefi: false, isSec: false, idSelectedChoice: null, availableChoices: [] },
    deck: { dices: [], rollsCounter: 0, rollsMaximum: 3 },
};

interface StepContentParams {
    currentStep: number;
    currentSnapshot: GameSnapshot | null;
    hasSnapshots: boolean;
    gameState: GameSnapshot;
    currentAction: TurnAction | null;
    playerName: string;
    player1Name: string;
    player2Name: string;
}

const renderStepContent = (params: StepContentParams): React.ReactNode => {
    const { currentStep, currentSnapshot, hasSnapshots, gameState, currentAction, playerName, player1Name, player2Name } = params;
    const isAtStart = currentStep <= 0;

    if (isAtStart) {
        return (
            <View style={styles.startCard}>
                <Feather name="play-circle" size={28} color={colors.textSecondary} />
                <Text style={styles.startText}>Début de la partie</Text>
                <Text style={styles.startSubtext}>
                    Utilisez les contrôles pour naviguer tour par tour
                </Text>
            </View>
        );
    }

    if (currentSnapshot) {
        return (
            <ReplayBoard
                gameState={gameState}
                action={currentAction}
                playerName={playerName}
                player1Name={player1Name}
                player2Name={player2Name}
            />
        );
    }

    if (!hasSnapshots) {
        return (
            <ReplayActionInfo
                action={currentAction}
                playerName={playerName}
            />
        );
    }

    return (
        <View style={styles.startCard}>
            <Feather name="play-circle" size={28} color={colors.textSecondary} />
            <Text style={styles.startText}>Début de la partie</Text>
            <Text style={styles.startSubtext}>
                Utilisez les contrôles pour naviguer tour par tour
            </Text>
        </View>
    );
};

const resolvePlayerName = (
    players: GameWithTurns['players'],
    playerNumber: number,
): string => {
    const player = players.find(p => p.playerNumber === playerNumber);
    if (!player) return `Joueur ${playerNumber}`;
    if (player.isBot) return 'Bot';
    return player.user?.username || `Joueur ${playerNumber}`;
};

const ReplayController: React.FC<ReplayControllerProps> = ({ navigation, gameId }) => {
    const [game, setGame] = useState<GameWithTurns | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const loadGame = async (): Promise<void> => {
            const result = await ReplayService.getGameWithTurns(gameId);
            setGame(result);
            setLoading(false);
        };
        loadGame();
    }, [gameId]);

    const turns = game?.turns ?? [];
    const hasSnapshots = turns.some(t => t.type === 'snapshot');
    const totalSteps = hasSnapshots ? Math.floor(turns.length / 2) : turns.length;

    const getActionForStep = (step: number): TurnAction | null => {
        if (step <= 0) return null;
        if (hasSnapshots) {
            const actionIndex = (step - 1) * 2;
            return turns[actionIndex] ?? null;
        }
        return turns[step - 1] ?? null;
    };

    const getSnapshotForStep = (step: number): GameSnapshot | null => {
        if (step <= 0 || !hasSnapshots) return null;
        const snapshotIndex = (step - 1) * 2 + 1;
        const snapshotTurn = turns[snapshotIndex];
        if (!snapshotTurn) return null;
        return snapshotTurn.data as unknown as GameSnapshot;
    };

    const stopAutoplay = useCallback((): void => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const startAutoplay = useCallback((): void => {
        setIsPlaying(true);
        intervalRef.current = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= totalSteps) {
                    stopAutoplay();
                    return prev;
                }
                return prev + 1;
            });
        }, AUTOPLAY_INTERVAL_MS);
    }, [totalSteps, stopAutoplay]);

    useEffect(() => {
        return () => { stopAutoplay(); };
    }, [stopAutoplay]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!game?.turns) {
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

    const currentAction = getActionForStep(currentStep);
    const currentSnapshot = getSnapshotForStep(currentStep);
    const player1Name = resolvePlayerName(game.players, 1);
    const player2Name = resolvePlayerName(game.players, 2);
    const gameState = currentSnapshot ?? DEFAULT_GAME_STATE;
    const playerName = currentAction ? resolvePlayerName(game.players, currentAction.playerNumber) : '';
    const isAtFirst = currentStep === 0;
    const isAtLast = currentStep === totalSteps;
    const prevColor = isAtFirst ? 'rgba(255,255,255,0.2)' : colors.textPrimary;
    const nextColor = isAtLast ? 'rgba(255,255,255,0.2)' : colors.white;

    const goNext = (): void => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const goPrev = (): void => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const toggleAutoplay = (): void => {
        if (isPlaying) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
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

            {renderStepContent({ currentStep, currentSnapshot, hasSnapshots, gameState, currentAction, playerName, player1Name, player2Name })}

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, isAtFirst && styles.controlDisabled]}
                    onPress={goPrev}
                    disabled={isAtFirst || isPlaying}
                    activeOpacity={0.7}
                >
                    <Feather name="skip-back" size={18} color={prevColor} />
                    <Text style={[styles.controlText, isAtFirst && styles.controlTextDisabled]}>
                        Précédent
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    style={[styles.playButton, isPlaying && styles.playButtonActive]}
                    onPress={toggleAutoplay}
                    activeOpacity={0.7}
                >
                    <Feather
                        name={isPlaying ? 'pause' : 'play'}
                        size={20}
                        color={colors.white}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.controlButtonPrimary, isAtLast && styles.controlDisabled]}
                    onPress={goNext}
                    disabled={isAtLast || isPlaying}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.controlText, styles.controlTextPrimary, isAtLast && styles.controlTextDisabled]}>
                        Suivant
                    </Text>
                    <Feather name="skip-forward" size={18} color={nextColor} />
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
    controls: { flexDirection: 'row', gap: 8, marginTop: 24 },
    controlButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: 12 },
    controlButtonPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
    controlDisabled: { opacity: 0.4 },
    controlText: { fontFamily: fontDisplay, fontSize: 12, fontWeight: '700', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 },
    controlTextPrimary: { color: colors.white },
    controlTextDisabled: { color: 'rgba(255,255,255,0.2)' },
    playButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 4 },
    playButtonActive: { backgroundColor: colors.gold },
});

export default ReplayController;
