import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

interface OpponentInfosProps {
    username?: string;
    avatar?: string;
    rank?: { name: string; tier: string; color: string } | null;
}

const OpponentInfos: React.FC<OpponentInfosProps> = ({
    username = 'Adversaire',
    avatar,
    rank,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.avatarBorder}>
                <View style={styles.avatar}>
                    {avatar ? (
                        <Text style={styles.avatarEmoji}>{avatar}</Text>
                    ) : (
                        <Feather name="user" size={14} color="rgba(255,255,255,0.2)" />
                    )}
                </View>
            </View>
            <View>
                <Text style={styles.label}>ADVERSAIRE</Text>
                <Text style={styles.username}>{username}</Text>
                {rank && (
                    <Text testID="opponent-rank" style={[styles.rank, { color: rank.color }]}>
                        {rank.name}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarBorder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: {
        fontSize: 16,
    },
    label: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    username: {
        fontFamily: fontSans,
        fontSize: 15,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
    },
    rank: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 1,
    },
});

export default OpponentInfos;
