import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '@/shared/contexts/socket.context';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import type { Socket } from 'socket.io-client';
import type { TimerPayload } from '@shared/types/socket-events.types';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

const PlayerTimer: React.FC = () => {
    const socket = useContext(SocketContext) as Socket;
    const [playerTimer, setPlayerTimer] = useState<number>(0);

    useEffect(() => {
        const onTimer = (data: TimerPayload): void => {
            setPlayerTimer(data['playerTimer']);
        };
        socket.on('game.timer', onTimer);
        return () => { socket.off('game.timer', onTimer); };
    }, []);

    return (
        <View style={styles.container}>
            <Feather name="clock" size={14} color={colors.primary} />
            <Text style={styles.timerText}>{playerTimer}s</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.glass,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    timerText: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
    },
});

export default PlayerTimer;
