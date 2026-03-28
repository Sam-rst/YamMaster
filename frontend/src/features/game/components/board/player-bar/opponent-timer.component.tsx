import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '@/shared/contexts/socket.context';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import type { Socket } from 'socket.io-client';
import type { TimerPayload } from '@shared/types/socket-events.types';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

const OpponentTimer: React.FC = () => {
    const socket = useContext(SocketContext) as Socket;
    const [opponentTimer, setOpponentTimer] = useState<number>(0);

    useEffect(() => {
        const onTimer = (data: TimerPayload): void => {
            setOpponentTimer(data['opponentTimer']);
        };
        socket.on('game.timer', onTimer);
        return () => { socket.off('game.timer', onTimer); };
    }, []);

    return (
        <View style={styles.container}>
            <Feather name="clock" size={12} color="rgba(233,69,96,0.6)" />
            <Text style={styles.timerText}>{opponentTimer}s</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.glass,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    timerText: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(233,69,96,0.6)',
    },
});

export default OpponentTimer;
