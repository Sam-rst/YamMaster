// frontend/src/features/replay/components/replay-action/replay-action.component.tsx
// Orchestrateur — dispatch vers le sous-composant adapté au type d'action

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';
import ReplayRoll from './replay-roll/replay-roll.component';
import ReplayLock from './replay-lock/replay-lock.component';
import ReplayChoice from './replay-choice/replay-choice.component';
import ReplayGrid from './replay-grid/replay-grid.component';
import ReplayDefi from './replay-defi/replay-defi.component';
import ReplayPredator from './replay-predator/replay-predator.component';

interface ReplayActionProps {
    type: string;
    data: Record<string, unknown>;
    playerName: string;
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const ACTION_COLORS: Record<string, string> = {
    roll: colors.blue,
    lock: colors.gold,
    choice: colors.success,
    grid: colors.primary,
    defi: colors.gold,
    predator: colors.primary,
};

const ACTION_LABELS: Record<string, string> = {
    roll: 'Lancer de dés',
    lock: 'Verrouillage',
    choice: 'Choix combinaison',
    grid: 'Placement pion',
    defi: 'Défi Royal',
    predator: 'Yam Predator',
};

const renderActionContent = (type: string, data: Record<string, unknown>): React.ReactNode => {
    switch (type) {
        case 'roll':
            return <ReplayRoll data={data as { dices: { id: number; value: string }[]; rollNumber: number }} />;
        case 'lock':
            return <ReplayLock data={data as { diceId: number; locked: boolean }} />;
        case 'choice':
            return <ReplayChoice data={data as { choiceId: string }} />;
        case 'grid':
            return <ReplayGrid data={data as { rowIndex: number; cellIndex: number }} />;
        case 'defi':
            return <ReplayDefi />;
        case 'predator':
            return <ReplayPredator />;
        default:
            return (
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {JSON.stringify(data)}
                </Text>
            );
    }
};

const ReplayAction: React.FC<ReplayActionProps> = ({ type, data, playerName }) => {
    const actionColor = ACTION_COLORS[type] || colors.textSecondary;

    return (
        <View style={styles.card}>
            <Text style={[styles.playerName, { color: actionColor }]}>{playerName}</Text>
            <Text style={styles.actionLabel}>{ACTION_LABELS[type] || type}</Text>
            <View style={styles.content}>
                {renderActionContent(type, data)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        gap: 8,
    },
    playerName: {
        fontFamily: fontDisplay,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    actionLabel: {
        fontFamily: fontDisplay,
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    content: {
        marginTop: 4,
    },
});

export default ReplayAction;
