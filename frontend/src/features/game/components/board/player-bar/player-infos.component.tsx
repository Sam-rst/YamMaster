import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/shared/contexts/auth.context';
import { colors } from '@/shared/theme/colors';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const PlayerInfos: React.FC = () => {
    const { user } = useAuth();
    const username = user?.username ?? 'Joueur';
    const avatar = user?.avatar;

    return (
        <View style={styles.container}>
            <View style={styles.avatarBorder}>
                <View style={styles.avatar}>
                    {avatar ? (
                        <Text style={styles.avatarEmoji}>{avatar}</Text>
                    ) : (
                        <Feather name="user" size={14} color={colors.textSecondary} />
                    )}
                </View>
            </View>
            <View>
                <Text style={styles.label}>Vous</Text>
                <Text style={styles.username}>{username}</Text>
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
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: colors.primary,
        padding: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    username: {
        fontFamily: fontSans,
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
});

export default PlayerInfos;
