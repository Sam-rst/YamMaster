// frontend/src/features/replay/components/replay-board/replay-action-info/replay-action-info.component.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/shared/theme/colors';
import { fontDisplay, fontSans } from '@/shared/theme/fonts';

interface ReplayAction {
    type: string;
    playerNumber: number;
    timestamp: number;
    data: Record<string, unknown>;
}

interface ReplayActionInfoProps {
    action: ReplayAction | null;
    playerName: string;
}

const ACTION_LABELS: Record<string, string> = {
    roll: 'Lancer de dés',
    lock: 'Verrouillage dé',
    choice: 'Choix combinaison',
    grid: 'Placement pion',
    defi: 'Défi Royal',
    predator: 'Yam Predator',
};

const ACTION_COLORS: Record<string, string> = {
    roll: colors.blue,
    lock: colors.gold,
    choice: colors.success,
    grid: colors.primary,
    defi: colors.gold,
    predator: colors.primary,
};

const ACTION_ICONS: Record<string, string> = {
    roll: 'refresh-cw',
    lock: 'lock',
    choice: 'check-circle',
    grid: 'grid',
    defi: 'zap',
    predator: 'target',
};

const ReplayActionInfo: React.FC<ReplayActionInfoProps> = ({ action, playerName }) => {
    if (!action) {
        return (
            <View style={styles.banner}>
                <Feather name="play" size={16} color={colors.success} />
                <Text style={[styles.label, { color: colors.success }]}>
                    Début de la partie
                </Text>
            </View>
        );
    }

    const actionColor = ACTION_COLORS[action.type] || colors.textSecondary;
    const actionLabel = ACTION_LABELS[action.type] || action.type;
    const actionIcon = ACTION_ICONS[action.type] || 'activity';

    return (
        <View style={styles.banner}>
            <Feather name={actionIcon} size={16} color={actionColor} />
            <Text style={[styles.playerText, { color: actionColor }]}>
                {playerName}
            </Text>
            <Text style={styles.separator}>—</Text>
            <Text style={styles.label}>{actionLabel}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 8,
    },
    playerText: {
        fontFamily: fontDisplay,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    separator: {
        fontFamily: fontSans,
        fontSize: 13,
        color: colors.textSecondary,
    },
    label: {
        fontFamily: fontSans,
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
    },
});

export default ReplayActionInfo;
