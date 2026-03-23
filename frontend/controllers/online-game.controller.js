// app/controller/online-game.controller.js

import React, { useEffect, useState, useContext } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";


export default function OnlineGameController({ navigation }) {

    const socket = useContext(SocketContext);

    const [inQueue, setInQueue] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [idOpponent, setIdOpponent] = useState(null);
    const [gameResult, setGameResult] = useState(null);

    useEffect(() => {
        console.log('[emit][queue.join]:', socket.id);
        socket.emit("queue.join");
        setInQueue(false);
        setInGame(false);

        socket.on('queue.added', (data) => {
            console.log('[listen][queue.added]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
        });

        socket.on('game.start', (data) => {
            console.log('[listen][game.start]:', data);
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            setIdOpponent(data['idOpponent']);
            setGameResult(null);
        });

        socket.on('game.end', (data) => {
            console.log('[listen][game.end]:', data);
            setInGame(false);
            setGameResult(data);
        });

    }, []);

    return (
        <View style={styles.container}>
            {!inQueue && !inGame && !gameResult && (
                <>
                    <Text style={styles.paragraph}>
                        Waiting for server datas...
                    </Text>
                    <Button
                        title="Return to home"
                        onPress={() => navigation && navigation.navigate('HomeScreen')}
                    />
                </>
            )}

            {inQueue && (
                <>
                    <Text style={styles.paragraph}>
                        Waiting for another player...
                    </Text>
                    <Button
                        title="Return to home"
                        onPress={() => navigation && navigation.navigate('HomeScreen')}
                    />
                </>
            )}

            {inGame && (
                <Board />
            )}

            {gameResult && (
                <View style={styles.endScreen}>
                    <Text style={styles.endTitle}>Fin de la partie</Text>
                    {gameResult.winner ? (
                        <Text style={styles.endText}>
                            Vainqueur : {gameResult.winner}
                        </Text>
                    ) : (
                        <Text style={styles.endText}>Égalité !</Text>
                    )}
                    <Text style={styles.endText}>
                        Score J1 : {gameResult.player1Score} — Score J2 : {gameResult.player2Score}
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
                                socket.emit("queue.join");
                                setInQueue(false);
                                setInGame(false);
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
