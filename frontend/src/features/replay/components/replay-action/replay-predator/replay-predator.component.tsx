import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

const ReplayPredator: React.FC = () => {
    return (
        <View style={styles.container}>
            <Feather name="zap" size={18} color={colors.primary} />
            <Text style={styles.text}>Yam Predator activé</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.3)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    text: {
        fontFamily: fontDisplay,
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});

export default ReplayPredator;
