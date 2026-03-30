// frontend/src/features/game/screens/bot-difficulty.screen.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface BotDifficultyScreenProps {
    navigation: {
        navigate: (screen: string, params?: object) => void;
        goBack: () => void;
    };
}

interface DifficultyCard {
    label: string;
    badge: string;
    stars: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    color: string;
}

const DIFFICULTY_CARDS: DifficultyCard[] = [
    {
        label: 'Débutant',
        badge: 'Facile',
        stars: '★☆☆',
        description: 'Pour se chauffer et découvrir les règles sans pression.',
        difficulty: 'EASY',
        color: colors.success,
    },
    {
        label: 'Tactique',
        badge: 'Intermédiaire',
        stars: '★★☆',
        description: 'Un défi équilibré pour progresser et affiner sa stratégie.',
        difficulty: 'MEDIUM',
        color: colors.gold,
    },
    {
        label: 'Maître IA',
        badge: 'Pro',
        stars: '★★★',
        description: "Aucun droit à l'erreur — le bot joue à la perfection.",
        difficulty: 'HARD',
        color: colors.primary,
    },
];

const BotDifficultyScreen: React.FC<BotDifficultyScreenProps> = ({ navigation }) => {
    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yam Master</Text>
                <View style={styles.headerSpacer} />
            </View>

            <Text style={styles.screenSubtitle}>Mode Entraînement</Text>

            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Choisir la Difficulté</Text>
            </View>

            <View style={styles.cardsContainer}>
                {DIFFICULTY_CARDS.map((card) => (
                    <TouchableOpacity
                        key={card.difficulty}
                        style={styles.card}
                        onPress={() => navigation.navigate('VsBotGameScreen', { difficulty: card.difficulty })}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardLeft}>
                                <View style={styles.cardTopRow}>
                                    <Text style={[styles.cardBadge, { color: card.color }]}>{card.badge}</Text>
                                    <Text style={[styles.cardStars, { color: card.color }]}>{card.stars}</Text>
                                </View>
                                <Text style={styles.cardLabel}>{card.label}</Text>
                                <Text style={styles.cardDescription}>{card.description}</Text>
                            </View>
                            <View style={[styles.cardIconCircle, { backgroundColor: card.color + '22' }]}>
                                <Feather name="cpu" size={24} color={card.color} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

export default BotDifficultyScreen;

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
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: fontDisplay,
        fontSize: 18,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    headerSpacer: {
        width: 40,
    },

    screenSubtitle: {
        fontFamily: fontSans,
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 4,
        textAlign: 'center',
        marginBottom: 32,
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

    cardsContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLeft: {
        flex: 1,
        marginRight: 16,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    cardBadge: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    cardStars: {
        fontSize: 12,
    },
    cardLabel: {
        fontFamily: fontDisplay,
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        color: colors.textPrimary,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    cardDescription: {
        fontFamily: fontSans,
        fontSize: 11,
        color: colors.textSecondary,
        lineHeight: 16,
    },
    cardIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
