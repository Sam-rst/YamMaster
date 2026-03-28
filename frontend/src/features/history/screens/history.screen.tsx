// frontend/src/features/history/screens/history.screen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/shared/contexts/auth.context';
import { colors } from '@/shared/theme/colors';
import HistoryService, { GameSummary } from '../services/history.service';

interface NavigationProp {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface Props {
    navigation: NavigationProp;
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const RESULT_LABELS: Record<string, string> = {
    WIN: 'Victoire',
    LOSE: 'Défaite',
    DRAW: 'Égalité',
    PENDING: 'En cours',
};

const RESULT_COLORS: Record<string, string> = {
    WIN: colors.success,
    LOSE: colors.primary,
    DRAW: colors.gold,
    PENDING: 'rgba(255,255,255,0.4)',
};

const RESULT_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
    WIN: 'award',
    LOSE: 'x-circle',
    DRAW: 'minus-circle',
    PENDING: 'clock',
};

const MODE_LABELS: Record<string, string> = {
    ONLINE: 'En ligne',
    VS_BOT: 'Vs Bot',
};

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const [games, setGames] = useState<GameSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadGames = async (): Promise<void> => {
            const result = await HistoryService.getGamesByUserId(user.id);
            setGames(result);
            setLoading(false);
        };

        loadGames();
    }, [user]);

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Hier';
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('HomeScreen')}
                    activeOpacity={0.7}
                >
                    <Feather name="chevron-left" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Historique</Text>
            </View>

            <View style={styles.sectionIntro}>
                <Text style={styles.sectionLabel}>Vos Exploits</Text>
                <Text style={styles.sectionTitle}>
                    Dernières <Text style={styles.sectionTitleAccent}>Parties</Text>
                </Text>
            </View>

            {games.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Feather name="inbox" size={40} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.emptyText}>Aucune partie jouée pour le moment</Text>
                </View>
            )}

            <View style={styles.gamesList}>
                {games.map((game) => {
                    const resultColor = RESULT_COLORS[game.myResult] || 'rgba(255,255,255,0.4)';
                    const resultIcon = RESULT_ICONS[game.myResult] || 'clock';

                    return (
                        <TouchableOpacity
                            key={game.id}
                            style={styles.gameCard}
                            onPress={() => navigation.navigate('ReplayScreen', { gameId: game.id })}
                            activeOpacity={0.85}
                        >
                            <View style={[styles.iconBox, { backgroundColor: `${resultColor}15` }]}>
                                <Feather name={resultIcon} size={22} color={resultColor} />
                            </View>

                            <View style={styles.cardContent}>
                                <View style={styles.cardTopRow}>
                                    <Text style={styles.opponentName}>{game.opponentName}</Text>
                                    <View style={styles.dateRow}>
                                        <Feather name="calendar" size={10} color="rgba(255,255,255,0.2)" />
                                        <Text style={styles.dateText}>{formatDate(game.createdAt)}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardBottomRow}>
                                    <View style={styles.resultRow}>
                                        <Text style={[styles.resultBadge, { color: resultColor, borderColor: `${resultColor}50` }]}>
                                            {RESULT_LABELS[game.myResult] || game.myResult}
                                        </Text>
                                        <Text style={styles.scoreText}>{game.scoreDisplay}</Text>
                                    </View>

                                    <Text style={styles.modeText}>
                                        {MODE_LABELS[game.mode] || game.mode}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
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

    sectionIntro: {
        marginBottom: 24,
        gap: 4,
    },
    sectionLabel: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '900',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 4,
    },
    sectionTitle: {
        fontFamily: fontDisplay,
        fontSize: 32,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    sectionTitleAccent: {
        color: colors.primary,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontFamily: fontSans,
        fontSize: 14,
        color: 'rgba(255,255,255,0.3)',
    },

    gamesList: {
        gap: 12,
    },
    gameCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        gap: 6,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    opponentName: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: -0.3,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    cardBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resultBadge: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    scoreText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '900',
        fontStyle: 'italic',
        color: 'rgba(255,255,255,0.6)',
    },
    modeText: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default HistoryScreen;
