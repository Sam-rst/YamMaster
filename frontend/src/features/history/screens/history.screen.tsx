// frontend/src/features/history/screens/history.screen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/shared/contexts/auth.context';
import HistoryService, { GameSummary } from '../services/history.service';

interface NavigationProp {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface Props {
    navigation: NavigationProp;
}

const RESULT_LABELS: Record<string, string> = {
    WIN: 'Victoire',
    LOSE: 'Défaite',
    DRAW: 'Égalité',
    PENDING: 'En cours',
};

const RESULT_COLORS: Record<string, string> = {
    WIN: '#4CAF50',
    LOSE: '#F44336',
    DRAW: '#FF9800',
    PENDING: '#999',
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
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Chargement...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Historique</Text>

            {games.length === 0 && (
                <Text style={styles.emptyText}>Aucune partie jouée pour le moment</Text>
            )}

            {games.map((game) => (
                <View key={game.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.mode}>
                            {MODE_LABELS[game.mode] || game.mode}
                        </Text>
                        <Text style={styles.date}>{formatDate(game.createdAt)}</Text>
                    </View>

                    <View style={styles.cardBody}>
                        <Text style={styles.opponent}>vs {game.opponentName}</Text>
                        <Text style={styles.score}>{game.scoreDisplay}</Text>
                    </View>

                    <View style={styles.cardFooter}>
                        <Text style={[styles.result, { color: RESULT_COLORS[game.myResult] || '#999' }]}>
                            {RESULT_LABELS[game.myResult] || game.myResult}
                        </Text>
                        <TouchableOpacity
                            style={styles.replayButton}
                            onPress={() => navigation.navigate('ReplayScreen', { gameId: game.id })}
                        >
                            <Text style={styles.replayButtonText}>Replay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('HomeScreen')}
            >
                <Text style={styles.backButtonText}>Retour au menu</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 40,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    mode: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    opponent: {
        fontSize: 16,
        fontWeight: '500',
    },
    score: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    result: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    replayButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    replayButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default HistoryScreen;
