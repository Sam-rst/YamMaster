import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SocketContext } from '@/shared/contexts/socket.context';
import { colors } from '@/shared/theme/colors';
import type { Socket } from 'socket.io-client';
import type { ScoreViewStatePayload } from '@shared/types/socket-events.types';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const PlayerTokens: React.FC = () => {
    const socket = useContext(SocketContext) as Socket;
    const [tokens, setTokens] = useState<number>(12);

    useEffect(() => {
        const onScore = (data: ScoreViewStatePayload): void => {
            setTokens(data.playerTokens);
        };
        socket.on('game.score', onScore);
        return () => { socket.off('game.score', onScore); };
    }, []);

    return (
        <View style={styles.container}>
            <Feather name="disc" size={10} color={colors.gold} />
            <Text style={styles.text}>{tokens}/12</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    text: {
        fontFamily: fontSans,
        fontSize: 13,
        fontWeight: '700',
        color: colors.gold,
    },
});

export default PlayerTokens;
