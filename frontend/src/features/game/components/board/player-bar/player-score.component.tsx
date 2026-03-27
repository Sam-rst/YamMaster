import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { SocketContext } from '@/shared/contexts/socket.context';
import { colors } from '@/shared/theme/colors';
import type { Socket } from 'socket.io-client';
import type { ScoreViewStatePayload } from '@shared/types/socket-events.types';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

const PlayerScore: React.FC = () => {
    const socket = useContext(SocketContext) as Socket;
    const [score, setScore] = useState<number>(0);

    useEffect(() => {
        const onScore = (data: ScoreViewStatePayload): void => {
            setScore(data.playerScore);
        };
        socket.on('game.score', onScore);
        return () => { socket.off('game.score', onScore); };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Score</Text>
            <Text style={styles.scoreText}>{score}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scoreText: {
        fontFamily: fontDisplay,
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
    },
});

export default PlayerScore;
