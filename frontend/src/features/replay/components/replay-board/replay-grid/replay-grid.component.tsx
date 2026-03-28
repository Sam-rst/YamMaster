// frontend/src/features/replay/components/replay-board/replay-grid/replay-grid.component.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/shared/theme/colors';
import { gridCellStyles, tokenStyles } from '@/shared/theme/game-styles';
import { fontSans } from '@/shared/theme/fonts';

interface GridCell {
    id: string;
    viewContent: string;
    owner: string | null;
    canBeChecked: boolean;
}

interface ReplayGridProps {
    grid: GridCell[][];
}

const CELL_SIZE = 48;

const getOwnerStyles = (owner: string | null) => {
    if (owner === 'player:1') {
        return { cell: gridCellStyles.playerOwned, token: tokenStyles.player };
    }
    if (owner === 'player:2') {
        return { cell: gridCellStyles.opponentOwned, token: tokenStyles.opponent };
    }
    return { cell: null, token: null };
};

const ReplayGrid: React.FC<ReplayGridProps> = ({ grid }) => {
    return (
        <View style={styles.container}>
            {grid.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((cell) => {
                        const ownerStyles = getOwnerStyles(cell.owner);

                        return (
                            <View
                                key={cell.id}
                                style={[
                                    gridCellStyles.base,
                                    styles.cell,
                                    ownerStyles.cell,
                                ]}
                            >
                                {ownerStyles.token && (
                                    <View style={[styles.token, ownerStyles.token]} />
                                )}
                                <Text style={styles.cellText}>
                                    {cell.viewContent}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 4,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 4,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        position: 'relative',
    },
    cellText: {
        fontFamily: fontSans,
        fontSize: 10,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    token: {
        position: 'absolute',
        top: 2,
        right: 2,
    },
});

export default ReplayGrid;
