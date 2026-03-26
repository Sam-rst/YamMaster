// frontend/src/features/replay/screens/replay.screen.tsx
// Zéro logique métier — affiche les tours envoyés par le backend

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ReplayService, { GameWithTurns, TurnAction } from '../services/replay.service';

interface NavigationProp {
    navigate: (screen: string) => void;
}

interface Props {
    navigation: NavigationProp;
    route: { params: { gameId: string } };
}

const ACTION_LABELS: Record<string, string> = {
    roll: 'Lancer de dés',
    lock: 'Verrouillage dé',
    choice: 'Choix combinaison',
    grid: 'Placement pion',
    defi: 'Défi activé',
    predator: 'Yam Predator',
    snapshot: 'État du jeu',
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
            <View style={styles.container}>
                <Text>Chargement...</Text>
            </View>
        );
    }

    if (!game || !game.turns) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Partie introuvable ou pas de données de replay</Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HistoryScreen')}>
                    <Text style={styles.buttonText}>Retour à l'historique</Text>
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
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Replay</Text>

            <Text style={styles.stepCounter}>{currentStep} / {totalSteps}</Text>

            {currentTurn && (
                <View style={styles.actionCard}>
                    <Text style={styles.actionPlayer}>
                        {getPlayerName(currentTurn.playerNumber)}
                    </Text>
                    <Text style={styles.actionType}>
                        {ACTION_LABELS[currentTurn.type] || currentTurn.type}
                    </Text>
                    <Text style={styles.actionData}>
                        {JSON.stringify(currentTurn.data, null, 2)}
                    </Text>
                </View>
            )}

            {!currentTurn && (
                <View style={styles.actionCard}>
                    <Text style={styles.actionType}>Début de la partie</Text>
                </View>
            )}

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, currentStep === 0 && styles.controlDisabled]}
                    onPress={goPrev}
                    disabled={currentStep === 0}
                >
                    <Text style={styles.controlText}>Précédent</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, currentStep === totalSteps && styles.controlDisabled]}
                    onPress={goNext}
                    disabled={currentStep === totalSteps}
                >
                    <Text style={styles.controlText}>Suivant</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HistoryScreen')}>
                <Text style={styles.buttonText}>Retour à l'historique</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#fff',
    },
    title: {
        fontSize: 24, fontWeight: 'bold', marginBottom: 10,
    },
    stepCounter: {
        fontSize: 16, color: '#666', marginBottom: 20,
    },
    actionCard: {
        width: '100%', maxWidth: 400, backgroundColor: '#f9f9f9',
        borderRadius: 8, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: '#eee',
    },
    actionPlayer: {
        fontSize: 14, fontWeight: 'bold', color: '#007AFF', marginBottom: 4,
    },
    actionType: {
        fontSize: 18, fontWeight: 'bold', marginBottom: 8,
    },
    actionData: {
        fontSize: 12, color: '#666', fontFamily: 'monospace',
    },
    controls: {
        flexDirection: 'row', gap: 12, marginBottom: 20,
    },
    controlButton: {
        backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24,
        borderRadius: 8,
    },
    controlDisabled: {
        backgroundColor: '#ccc',
    },
    controlText: {
        color: '#fff', fontSize: 16, fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16, color: '#999', marginBottom: 20,
    },
    button: {
        paddingVertical: 12, paddingHorizontal: 24,
        backgroundColor: '#007AFF', borderRadius: 8,
    },
    buttonText: {
        color: '#fff', fontSize: 16,
    },
});

export default ReplayScreen;
