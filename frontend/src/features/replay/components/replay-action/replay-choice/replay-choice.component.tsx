import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

interface ReplayChoiceProps {
    data: {
        choiceId: string;
    };
}

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const ReplayChoice: React.FC<ReplayChoiceProps> = ({ data }) => {
    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Feather name="check-square" size={16} color={colors.success} />
            </View>
            <View style={styles.chip}>
                <Text style={styles.chipText}>{data.choiceId}</Text>
            </View>
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
        backgroundColor: 'rgba(14, 173, 105, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chip: {
        backgroundColor: 'rgba(14, 173, 105, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(14, 173, 105, 0.3)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    chipText: {
        fontFamily: fontSans,
        fontSize: 13,
        fontWeight: '700',
        color: colors.success,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default ReplayChoice;
