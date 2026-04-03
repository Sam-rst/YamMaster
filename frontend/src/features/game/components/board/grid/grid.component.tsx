// frontend/src/features/game/components/board/grid/grid.component.tsx

import React, { useEffect, useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SocketContext } from '@/shared/contexts/socket.context';
import { colors } from '@/shared/theme/colors';
import type { Socket } from 'socket.io-client';
import type { GridCell } from '@shared/types/game.types';
import type { GridViewStatePayload } from '@shared/types/socket-events.types';

const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });
const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });

const Grid: React.FC = () => {
    const socket = useContext(SocketContext) as Socket;

    const [displayGrid, setDisplayGrid] = useState<boolean>(true);
    const [canSelectCells, setCanSelectCells] = useState<boolean>(false);
    const [grid, setGrid] = useState<GridCell[][]>([]);
    const [yamPredatorMode, setYamPredatorMode] = useState<boolean>(false);

    const handleSelectCell = (cellId: string, rowIndex: number, cellIndex: number, cell: GridCell): void => {
        if (yamPredatorMode && cell.owner && cell.owner !== null) {
            socket.emit('game.grid.yamPredator', { rowIndex, cellIndex });
            setYamPredatorMode(false);
        } else if (canSelectCells && cell.canBeChecked) {
            socket.emit('game.grid.selected', { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        const onGridViewState = (data: GridViewStatePayload): void => {
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(data['canSelectCells']);
            setGrid(data['grid']);
        };
        socket.on('game.grid.view-state', onGridViewState);

        const onYamPredatorActivate = (): void => {
            setYamPredatorMode(true);
        };
        socket.on('game.yamPredator.activate', onYamPredatorActivate);

        return () => {
            socket.off('game.grid.view-state', onGridViewState);
            socket.off('game.yamPredator.activate', onYamPredatorActivate);
        };
    }, []);

    return (
        <View style={styles.gridContainer}>
            {yamPredatorMode && (
                <View style={styles.predatorBanner}>
                    <View style={styles.predatorBannerContent}>
                        <View style={styles.predatorIconBg}>
                            <Feather name="zap" size={16} color={colors.white} />
                        </View>
                        <View>
                            <Text style={styles.predatorTitle}>Yam Predator !</Text>
                            <Text style={styles.predatorSubtitle}>Retirez un pion adverse</Text>
                        </View>
                    </View>
                </View>
            )}
            {displayGrid && (
                <View style={styles.gridWrapper}>
                    {grid.map((row: GridCell[], rowIndex: number) => (
                        <View key={`row-${row[0]?.id ?? rowIndex}`} style={styles.row}>
                            {row.map((cell: GridCell, cellIndex: number) => (
                                <TouchableOpacity
                                    key={`${rowIndex}-${cellIndex}`}
                                    style={[
                                        styles.cell,
                                        cell.owner === 'player:1' && styles.playerOwnedCell,
                                        cell.owner === 'player:2' && styles.opponentOwnedCell,
                                        (cell.canBeChecked && !cell.owner) && styles.canBeCheckedCell,
                                        yamPredatorMode && cell.owner && styles.predatorTargetCell,
                                    ]}
                                    onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex, cell)}
                                    disabled={!yamPredatorMode && !cell.canBeChecked}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.cellText,
                                        cell.owner === 'player:1' && styles.playerCellText,
                                        cell.owner === 'player:2' && styles.opponentCellText,
                                    ]}>
                                        {cell.viewContent}
                                    </Text>
                                    {cell.owner === 'player:1' && (
                                        <View style={styles.playerToken} />
                                    )}
                                    {cell.owner === 'player:2' && (
                                        <View style={styles.opponentToken} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        width: '100%',
        maxWidth: 500,
        aspectRatio: 1,
        alignSelf: 'center',
        flexDirection: 'column',
    },
    gridWrapper: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(22, 33, 62, 0.2)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        padding: 2,
    },
    row: {
        flexDirection: 'row',
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        marginBottom: 2,
    },
    cell: {
        flex: 2,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.glass,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cellText: {
        fontFamily: fontSans,
        fontSize: 14,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    playerOwnedCell: {
        backgroundColor: 'rgba(233, 69, 96, 0.05)',
        borderColor: 'rgba(233, 69, 96, 0.3)',
    },
    opponentOwnedCell: {
        backgroundColor: 'rgba(0, 210, 255, 0.05)',
        borderColor: 'rgba(0, 210, 255, 0.3)',
    },
    canBeCheckedCell: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    predatorTargetCell: {
        backgroundColor: 'rgba(233, 69, 96, 0.2)',
        borderColor: colors.primary,
        borderWidth: 2,
    },
    playerCellText: {
        color: 'rgba(255,255,255,0.5)',
    },
    opponentCellText: {
        color: 'rgba(255,255,255,0.5)',
    },
    playerToken: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        marginTop: 2,
    },
    opponentToken: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.blue,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        marginTop: 2,
    },
    predatorBanner: {
        backgroundColor: colors.primary,
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    predatorBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    predatorIconBg: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 6,
        borderRadius: 20,
    },
    predatorTitle: {
        fontFamily: fontDisplay,
        fontSize: 13,
        fontWeight: '700',
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    predatorSubtitle: {
        fontFamily: fontSans,
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});

export default Grid;
