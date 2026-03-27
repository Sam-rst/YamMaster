import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

interface ReplayLockProps {
    data: {
        diceId: number;
        locked: boolean;
    };
}

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const ReplayLock: React.FC<ReplayLockProps> = ({ data }) => {
    const isLocked = data.locked;

    return (
        <View style={styles.container}>
            <View style={[styles.badge, isLocked ? styles.badgeLocked : styles.badgeUnlocked]}>
                <Feather
                    name={isLocked ? 'lock' : 'unlock'}
                    size={16}
                    color={isLocked ? colors.gold : colors.textSecondary}
                />
            </View>
            <Text style={styles.text}>
                Dé {data.diceId} {isLocked ? 'verrouillé' : 'déverrouillé'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    badge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeLocked: {
        backgroundColor: 'rgba(244, 211, 94, 0.15)',
    },
    badgeUnlocked: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
        fontFamily: fontSans,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
});

export default ReplayLock;
