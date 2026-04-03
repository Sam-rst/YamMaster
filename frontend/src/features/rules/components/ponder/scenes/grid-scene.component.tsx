import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/shared/theme/colors';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

type CellState = 'empty' | 'highlighted' | 'player' | 'opponent';

interface CellProps {
    state: CellState;
}

const Cell: React.FC<CellProps> = ({ state }) => {
    const isHighlighted = state === 'highlighted';
    const hasPlayerToken = state === 'player';
    const hasOpponentToken = state === 'opponent';

    return (
        <View style={[
            styles.cell,
            isHighlighted && styles.cellHighlighted,
            hasPlayerToken && styles.cellPlayer,
            hasOpponentToken && styles.cellOpponent,
        ]}>
            {hasPlayerToken && <View style={[styles.token, styles.tokenPlayer]} />}
            {hasOpponentToken && <View style={[styles.token, styles.tokenOpponent]} />}
        </View>
    );
};

interface GridCell { id: string; state: CellState }
type GridData = GridCell[][];

const buildEmptyGrid = (): GridData =>
    Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 5 }, (__, c) => ({ id: `${r}-${c}`, state: 'empty' as CellState }))
    );

const mapGrid = (grid: GridData, fn: (state: CellState, r: number, c: number) => CellState): GridData =>
    grid.map((row, r) => row.map((cell, c) => ({ ...cell, state: fn(cell.state, r, c) })));

const STEP_0_GRID: GridData = buildEmptyGrid();

const STEP_1_GRID: GridData = mapGrid(buildEmptyGrid(), (_, r, c) =>
    (r === 2 && c >= 1 && c <= 3 ? 'highlighted' : 'empty')
);

const STEP_2_GRID: GridData = mapGrid(buildEmptyGrid(), (_, r, c) => {
    if (r === 2 && c === 2) return 'player';
    if (r === 2 && c >= 1 && c <= 3) return 'highlighted';
    return 'empty';
});

const STEP_3_GRID: GridData = mapGrid(buildEmptyGrid(), (_, r, c) => {
    if (r === 2 && c === 2) return 'player';
    if (r === 1 && c === 3) return 'opponent';
    return 'empty';
});

interface StepConfig {
    label: string;
    description: string;
    grid: GridData;
}

const STEPS: StepConfig[] = [
    {
        label: 'La grille',
        description: 'La grille 5×5 est le terrain de jeu. Chaque case correspond à une combinaison.',
        grid: STEP_0_GRID,
    },
    {
        label: 'Combinaison réussie',
        description: "Quand vous réussissez une combinaison, les cases correspondantes s'illuminent.",
        grid: STEP_1_GRID,
    },
    {
        label: 'Poser un pion',
        description: 'Choisissez une case illuminée pour y placer votre pion.',
        grid: STEP_2_GRID,
    },
    {
        label: 'Pions en jeu',
        description: "Votre adversaire pose ses pions également. Surveillez le plateau !",
        grid: STEP_3_GRID,
    },
];

interface GridSceneProps {
    currentStep: number;
}

const GridScene: React.FC<GridSceneProps> = ({ currentStep }) => {
    const step = STEPS[currentStep] ?? STEPS[0];

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{step.label}</Text>
            <Text style={styles.description}>{step.description}</Text>

            <View style={styles.grid}>
                {step.grid.map((row) => (
                    <View key={row[0].id.split('-')[0]} style={styles.row}>
                        {row.map((cell) => (
                            <Cell key={cell.id} state={cell.state} />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

export default GridScene;

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
    description: {
        fontFamily: fontSans,
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 16,
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
    cellHighlighted: {
        borderColor: colors.cellHighlightBorder,
        backgroundColor: colors.cellHighlight,
    },
    cellPlayer: {
        borderColor: colors.cellPlayerOwnedBorder,
        backgroundColor: colors.cellPlayerOwned,
    },
    cellOpponent: {
        borderColor: colors.cellOpponentOwnedBorder,
        backgroundColor: colors.cellOpponentOwned,
    },
    token: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    tokenPlayer: {
        backgroundColor: colors.playerToken,
    },
    tokenOpponent: {
        backgroundColor: colors.opponentToken,
    },
});
