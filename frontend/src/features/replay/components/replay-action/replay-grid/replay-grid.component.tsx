import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';

interface ReplayGridProps {
    data: {
        rowIndex: number;
        cellIndex: number;
    };
}

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const ReplayGrid: React.FC<ReplayGridProps> = ({ data }) => {
    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Feather name="grid" size={16} color={colors.primary} />
            </View>
            <View style={styles.coords}>
                <Text style={styles.coordText}>Ligne {data.rowIndex + 1}</Text>
                <Text style={styles.separator}>·</Text>
                <Text style={styles.coordText}>Colonne {data.cellIndex + 1}</Text>
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
        backgroundColor: 'rgba(233, 69, 96, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coords: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    coordText: {
        fontFamily: fontSans,
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    separator: {
        fontSize: 14,
        color: colors.textSecondary,
    },
});

export default ReplayGrid;
