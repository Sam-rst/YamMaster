// frontend/src/features/game/controllers/vs-bot-game.controller.tsx

import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, Platform, ActivityIndicator } from 'react-native';
import { SocketContext } from '@/shared/contexts/socket.context';
import Board from '../components/board/board.component';
import EndScreen from '../components/board/end-screen/end-screen.component';
import { colors } from '@/shared/theme/colors';
import type { Socket } from 'socket.io-client';
import type { VictoryResult } from '@shared/types/game.types';
import type { GameStartPayload, OpponentInfo } from '@shared/types/socket-events.types';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface VsBotGameControllerProps {
    navigation?: {
        navigate: (screen: string) => void;
    };
    difficulty?: string;
}

const VsBotGameController: React.FC<VsBotGameControllerProps> = ({ navigation, difficulty }) => {
    const socket = useContext(SocketContext) as Socket;

    const [inGame, setInGame] = useState<boolean>(false);
    const [gameResult, setGameResult] = useState<VictoryResult | null>(null);
    const [opponentInfo, setOpponentInfo] = useState<OpponentInfo | null>(null);

    useEffect(() => {
        console.log('[emit][game.vsbot]:', socket.id);
        socket.emit('game.vsbot', { difficulty: difficulty ?? 'MEDIUM' });

        const onGameStart = (data: GameStartPayload): void => {
            setInGame(data['inGame']);
            setOpponentInfo(data.opponent);
            setGameResult(null);
        };
        const onGameEnd = (data: VictoryResult): void => {
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

    if (inGame) {
        return <Board opponentInfo={opponentInfo} />;
    }

    return (
        <View style={styles.container}>
            {!gameResult && (
                <View style={styles.waitingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.waitingText}>Lancement de la partie contre le bot...</Text>
                </View>
            )}

            {gameResult && (
                <EndScreen
                    isWin={gameResult.isWinner ?? gameResult.winner === 'player:1'}
                    isDraw={gameResult.isDraw ?? !gameResult.winner}
                    playerScore={gameResult.player1Score}
                    opponentScore={gameResult.player2Score}
                    reason={gameResult.reason}
                    opponentName={gameResult.opponentName}
                    onReplay={() => {
                        setGameResult(null);
                        setInGame(false);
                        socket.emit('game.vsbot', { difficulty: difficulty ?? 'MEDIUM' });
                    }}
                    onHome={() => navigation?.navigate('HomeScreen')}
                />
            )}
        </View>
    );
};

export default VsBotGameController;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    waitingContainer: {
        alignItems: 'center',
        gap: 16,
    },
    waitingText: {
        fontFamily: fontSans,
        fontSize: 14,
        color: colors.textSecondary,
    },
    endContainer: {
        alignItems: 'center',
        padding: 24,
        gap: 16,
    },
    endTitle: {
        fontFamily: fontDisplay,
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    endResult: {
        fontFamily: fontDisplay,
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    scoreCard: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    scoreText: {
        fontFamily: fontSans,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    reasonText: {
        fontFamily: fontSans,
        fontSize: 12,
        color: colors.textSecondary,
    },
    endButtons: {
        gap: 10,
        width: '100%',
        maxWidth: 300,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontFamily: fontSans,
        fontSize: 12,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});
