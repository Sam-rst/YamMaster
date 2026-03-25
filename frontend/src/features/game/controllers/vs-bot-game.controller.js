// app/controllers/vs-bot-game.controller.js

import React, { useEffect, useState, useContext } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { SocketContext } from '@/shared/contexts/socket.context';
import Board from "../components/board/board.component";

export default function VsBotGameController({ navigation }) {

    const socket = useContext(SocketContext);

    const [inGame, setInGame] = useState(false);
    const [gameResult, setGameResult] = useState(null);

    useEffect(() => {
        console.log('[emit][game.vsbot]:', socket.id);
        socket.emit("game.vsbot");

        const onGameStart = (data) => {
            setInGame(data['inGame']);
            setGameResult(null);
        };
        const onGameEnd = (data) => {
            setInGame(false);
            setGameResult(data);
        };

        socket.on('game.start', onGameStart);
        socket.on('game.end', onGameEnd);

        return () => {
            socket.off('game.start', onGameStart);
            socket.off('game.end', onGameEnd);
        };
    }, []);

    return (
        <View style={styles.container}>
            {!inGame && !gameResult && (
                <Text style={styles.paragraph}>
                    Lancement de la partie contre le bot...
                </Text>
            )}

            {inGame && (
                <Board />
            )}

            {gameResult && (
                <View style={styles.endScreen}>
                    <Text style={styles.endTitle}>Fin de la partie</Text>
                    {gameResult.winner ? (
                        <Text style={styles.endText}>
                            Vainqueur : {gameResult.winner === 'player:1' ? 'Vous' : 'Bot'}
                        </Text>
                    ) : (
                        <Text style={styles.endText}>Égalité !</Text>
                    )}
                    <Text style={styles.endText}>
                        Votre score : {gameResult.player1Score} — Bot : {gameResult.player2Score}
                    </Text>
                    <Text style={styles.endText}>
                        Raison : {gameResult.reason === 'alignment5' ? 'Alignement de 5 pions' : 'Plus de pions disponibles'}
                    </Text>
                    <View style={styles.endButtons}>
                        <Button
                            title="Retour au menu"
                            onPress={() => navigation && navigation.navigate('HomeScreen')}
                        />
                        <Button
                            title="Rejouer"
                            onPress={() => {
                                setGameResult(null);
                                setInGame(false);
                                socket.emit("game.vsbot");
                            }}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        width: '100%',
        height: '100%',
    },
    paragraph: {
        fontSize: 16,
    },
    endScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    endTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    endText: {
        fontSize: 16,
        marginBottom: 10,
    },
    endButtons: {
        marginTop: 20,
        flexDirection: 'row',
        gap: 10,
    },
});
