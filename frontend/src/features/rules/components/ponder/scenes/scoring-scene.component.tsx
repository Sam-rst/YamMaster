import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

type CellState = 'empty' | 'player' | 'playerGlow';

interface CellProps {
    state: CellState;
}

const Cell: React.FC<CellProps> = ({ state }) => {
    const hasToken = state === 'player' || state === 'playerGlow';
    const isGlow = state === 'playerGlow';

    return (
        <View style={[
            styles.cell,
            hasToken && styles.cellPlayer,
        ]}>
            {hasToken && (
                <View style={[styles.token, isGlow && styles.tokenGlow]} />
            )}
        </View>
    );
};

type GridData = CellState[][];

const buildEmptyGrid = (): GridData =>
    Array.from({ length: 5 }, () => new Array(5).fill('empty') as CellState[]);

const markCells = (
    base: GridData,
    cells: [number, number][],
    state: CellState,
): GridData =>
    base.map((row, r) =>
        row.map((cell, c): CellState => {
            const match = cells.find(([cr, cc]) => cr === r && cc === c);
            return match ? state : cell;
        })
    );

const STEP_0_GRID: GridData = markCells(
    buildEmptyGrid(),
    [[2, 1], [2, 2], [2, 3]],
    'playerGlow',
);

const STEP_1_GRID: GridData = markCells(
    buildEmptyGrid(),
    [[1, 1], [2, 2], [3, 3], [4, 4]],
    'playerGlow',
);

const STEP_2_GRID: GridData = markCells(
    buildEmptyGrid(),
    [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
    'playerGlow',
);

interface StepConfig {
    label: string;
    scoreBadge: string;
    scoreBadgeGold?: boolean;
    grid: GridData;
}

const STEPS: StepConfig[] = [
    {
        label: '3 pions alignés',
        scoreBadge: '+1 point',
        grid: STEP_0_GRID,
    },
    {
        label: '4 pions alignés',
        scoreBadge: '+2 points',
        grid: STEP_1_GRID,
    },
    {
        label: '5 pions alignés',
        scoreBadge: 'VICTOIRE INSTANTANÉE',
        scoreBadgeGold: true,
        grid: STEP_2_GRID,
    },
];

interface ScoringSceneProps {
    currentStep: number;
}

const ScoringScene: React.FC<ScoringSceneProps> = ({ currentStep }) => {
    const step = STEPS[currentStep] ?? STEPS[0];

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{step.label}</Text>

            <View style={styles.grid}>
                {step.grid.map((row, r) => (
                    <View key={`row-${r}`} style={styles.row}>
                        {row.map((cellState, c) => (
                            <Cell key={`cell-${r}-${c}`} state={cellState} />
                        ))}
                    </View>
                ))}
            </View>

            <View style={[styles.badge, step.scoreBadgeGold ? styles.badgeGold : styles.badgeBlue]}>
                <Text style={[styles.badgeText, step.scoreBadgeGold ? styles.badgeTextGold : styles.badgeTextBlue]}>
                    {step.scoreBadge}
                </Text>
            </View>
        </View>
    );
};

export default ScoringScene;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    label: {
        fontFamily: fontSans,
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    grid: {
        gap: 4,
        marginVertical: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 4,
    },
    cell: {
        width: 40,
        height: 40,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellPlayer: {
        borderColor: colors.cellPlayerOwnedBorder,
        backgroundColor: colors.cellPlayerOwned,
    },
    token: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.playerToken,
    },
    tokenGlow: {
        shadowColor: colors.playerToken,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 6,
    },
    badge: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    badgeBlue: {
        borderColor: colors.blue,
    },
    badgeGold: {
        borderColor: colors.gold,
    },
    badgeText: {
        fontFamily: fontSans,
        fontSize: 14,
        fontWeight: '700',
    },
    badgeTextBlue: {
        color: colors.blue,
    },
    badgeTextGold: {
        color: colors.gold,
    },
});
