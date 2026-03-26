// frontend/src/features/history/screens/history.screen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@/shared/contexts/auth.context';
import HistoryService from '../services/history.service';

interface NavigationProp {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface Props {
    navigation: NavigationProp;
}

interface GameSummary {
    id: string;
    mode: string;
    status: string;
    player1Score: number;
    player2Score: number;
    player1: { id: string; username: string } | null;
    player2: { id: string; username: string } | null;
    winner: { id: string; username: string } | null;
    createdAt: string;
}

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

    const getOpponentName = (game: GameSummary): string => {
        if (game.mode === 'VS_BOT') return 'Bot';
        if (game.player1?.id === user?.id) return game.player2?.username || 'Inconnu';
        return game.player1?.username || 'Inconnu';
    };

    const getResult = (game: GameSummary): 'victoire' | 'défaite' | 'égalité' => {
        if (!game.winner) return 'égalité';
        return game.winner.id === user?.id ? 'victoire' : 'défaite';
    };

    const getResultColor = (result: string): string => {
        if (result === 'victoire') return '#4CAF50';
        if (result === 'défaite') return '#F44336';
        return '#FF9800';
    };

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

            {games.map((game) => {
                const result = getResult(game);
                const resultColor = getResultColor(result);
                const opponent = getOpponentName(game);

                return (
                    <View key={game.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.mode}>
                                {game.mode === 'ONLINE' ? 'En ligne' : 'Vs Bot'}
                            </Text>
                            <Text style={styles.date}>{formatDate(game.createdAt)}</Text>
                        </View>

                        <View style={styles.cardBody}>
                            <Text style={styles.opponent}>vs {opponent}</Text>
                            <Text style={styles.score}>
                                {game.player1Score} - {game.player2Score}
                            </Text>
                        </View>

                        <Text style={[styles.result, { color: resultColor }]}>
                            {result === 'victoire' ? 'Victoire' : result === 'défaite' ? 'Défaite' : 'Égalité'}
                        </Text>
                    </View>
                );
            })}

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
    result: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
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
