// app/components/board/grid/grid.component.js

import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../../shared/contexts/socket.context";

const Grid = () => {

    const socket = useContext(SocketContext);

    const [displayGrid, setDisplayGrid] = useState(true);
    const [canSelectCells, setCanSelectCells] = useState([]);
    const [grid, setGrid] = useState([]);
    const [yamPredatorMode, setYamPredatorMode] = useState(false);

    const handleSelectCell = (cellId, rowIndex, cellIndex, cell) => {
        if (yamPredatorMode && cell.owner && cell.owner !== null) {
            // En mode Yam Predator, cliquer sur un pion adverse pour le retirer
            socket.emit("game.grid.yamPredator", { rowIndex, cellIndex });
            setYamPredatorMode(false);
        } else if (canSelectCells && cell.canBeChecked) {
            socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        const onGridViewState = (data) => {
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(data['canSelectCells']);
            setGrid(data['grid']);
        };
        socket.on("game.grid.view-state", onGridViewState);

        const onYamPredatorActivate = () => {
            setYamPredatorMode(true);
        };
        socket.on("game.yamPredator.activate", onYamPredatorActivate);

        return () => {
            socket.off("game.grid.view-state", onGridViewState);
            socket.off("game.yamPredator.activate", onYamPredatorActivate);
        };
    }, []);

    return (
        <View style={styles.gridContainer}>
            {yamPredatorMode && (
                <View style={styles.predatorBanner}>
                    <Text style={styles.predatorBannerText}>Yam Predator : cliquez sur un pion adverse</Text>
                </View>
            )}
            {displayGrid &&
                grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((cell, cellIndex) => (
                            <TouchableOpacity
                                key={`${rowIndex}-${cellIndex}`}
                                style={[
                                    styles.cell,
                                    cell.owner === "player:1" && styles.playerOwnedCell,
                                    cell.owner === "player:2" && styles.opponentOwnedCell,
                                    (cell.canBeChecked && !cell.owner) && styles.canBeCheckedCell,
                                    yamPredatorMode && cell.owner && styles.predatorTargetCell,
                                    rowIndex !== 0 && styles.topBorder,
                                    cellIndex !== 0 && styles.leftBorder,
                                ]}
                                onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex, cell)}
                                disabled={!yamPredatorMode && !cell.canBeChecked}
                            >
                                <Text style={styles.cellText}>{cell.viewContent}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    cell: {
        flexDirection: "row",
        flex: 2,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "black",
    },
    cellText: {
        fontSize: 11,
    },
    playerOwnedCell: {
        backgroundColor: "lightgreen",
        opacity: 0.9,
    },
    opponentOwnedCell: {
        backgroundColor: "lightcoral",
        opacity: 0.9,
    },
    canBeCheckedCell: {
        backgroundColor: "lightyellow",
    },
    predatorTargetCell: {
        borderColor: "red",
        borderWidth: 2,
    },
    predatorBanner: {
        backgroundColor: "#8b0000",
        width: "100%",
        paddingVertical: 4,
        alignItems: "center",
    },
    predatorBannerText: {
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
    },
    topBorder: {
        borderTopWidth: 1,
    },
    leftBorder: {
        borderLeftWidth: 1,
    },
});

export default Grid;
