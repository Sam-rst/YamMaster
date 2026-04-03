// frontend/src/features/home/screens/home.screen.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/shared/contexts/auth.context';
import { colors } from '@/shared/theme/colors';

interface HomeScreenProps {
    navigation: {
        navigate: (screen: string) => void;
    };
}

interface ActionItem {
    screen: string;
    icon: keyof typeof Feather.glyphMap;
    label: string;
    description: string;
    color: string;
}

const ACTIONS: ActionItem[] = [
    {
        screen: 'OnlineGameScreen',
        icon: 'globe',
        label: 'Partie en ligne',
        description: 'Affrontez le monde entier',
        color: colors.primary,
    },
    {
        screen: 'BotDifficultyScreen',
        icon: 'cpu',
        label: 'Vs Bot',
        description: 'Entraînement tactique',
        color: colors.accent,
    },
    {
        screen: 'HistoryScreen',
        icon: 'clock',
        label: 'Historique',
        description: 'Mes derniers résultats',
        color: colors.secondary,
    },
];

const fontDisplay = Platform.select({
    web: '"Outfit", sans-serif',
    default: 'Outfit',
});

const fontSans = Platform.select({
    web: '"Inter", sans-serif',
    default: 'Inter',
});

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const username = user?.username ?? 'Joueur';

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarBorder}>
                        <View style={styles.avatar}>
                            {user?.avatar ? (
                                <Text style={{ fontSize: 20 }}>{user.avatar}</Text>
                            ) : (
                                <Feather name="user" size={20} color={colors.textSecondary} />
                            )}
                        </View>
                    </View>
                    <View>
                        <Text style={styles.greetingLabel}>Bonjour,</Text>
                        <Text style={styles.greetingName}>{username}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsCard}>
                <View style={styles.statsRow}>
                    <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>Rang Actuel</Text>
                        <Text style={styles.statValue}>Bronze IV</Text>
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarTrack}>
                                <View style={styles.progressBarFill} />
                            </View>
                            <Text style={styles.mmrText}>750 MMR</Text>
                        </View>
                    </View>
                    <View style={styles.statBlockRight}>
                        <Text style={styles.statLabel}>Ratio V/D</Text>
                        <View style={styles.ratioRow}>
                            <Feather name="trending-up" size={16} color={colors.success} />
                            <Text style={styles.ratioValue}>--</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Prêt à jouer ?</Text>
            </View>

            <View style={styles.actionsContainer}>
                {ACTIONS.map((action) => (
                    <TouchableOpacity
                        key={action.screen}
                        style={styles.actionCard}
                        onPress={() => navigation.navigate(action.screen)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.actionContent}>
                            <View>
                                <Text style={styles.actionLabel}>{action.label}</Text>
                                <Text style={styles.actionDesc}>{action.description}</Text>
                            </View>
                            <View style={[styles.actionIconBox, { backgroundColor: action.color }]}>
                                <Feather name={action.icon} size={24} color={colors.white} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.footer}>
                <LinearGradient
                    colors={['rgba(233, 69, 96, 0.1)', 'rgba(233, 69, 96, 0.05)']}
                    style={styles.onlineBadge}
                >
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>En ligne</Text>
                </LinearGradient>
            </View>
        </ScrollView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 48,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarBorder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: colors.primary,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    greetingLabel: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    greetingName: {
        fontFamily: fontDisplay,
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },

    statsCard: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBlock: {
        flex: 1,
    },
    statBlockRight: {
        alignItems: 'flex-end',
    },
    statLabel: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '900',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    statValue: {
        fontFamily: fontDisplay,
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    progressBarTrack: {
        width: 96,
        height: 6,
        backgroundColor: colors.background,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        width: '75%',
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    mmrText: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    ratioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratioValue: {
        fontFamily: fontDisplay,
        fontSize: 22,
        fontWeight: '700',
        color: colors.success,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    sectionAccent: {
        width: 24,
        height: 2,
        backgroundColor: colors.primary,
    },
    sectionTitle: {
        fontFamily: fontDisplay,
        fontSize: 13,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },

    actionsContainer: {
        gap: 14,
        marginBottom: 28,
    },
    actionCard: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        height: 100,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    actionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionLabel: {
        fontFamily: fontDisplay,
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        color: colors.textPrimary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    actionDesc: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    actionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    footer: {
        alignItems: 'center',
        paddingTop: 8,
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.2)',
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    onlineText: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
});
