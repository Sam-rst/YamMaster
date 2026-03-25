// app/components/board/dev/dev-panel.component.js

import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SocketContext } from "@/shared/contexts/socket.context";

const DevPanel = () => {
    const socket = useContext(SocketContext);
    const [visible, setVisible] = useState(false);
    const [grid, setGrid] = useState([]);
    const [placing, setPlacing] = useState('player:1'); // player:1 ou player:2

    useEffect(() => {
        const onGridViewState = (data) => {
            setGrid(data['grid']);
        };
        socket.on("game.grid.view-state", onGridViewState);
        return () => socket.off("game.grid.view-state", onGridViewState);
    }, []);

    const handleDevPlace = (rowIndex, cellIndex) => {
        socket.emit("game.dev.place", { rowIndex, cellIndex, owner: placing });
    };

    if (!visible) {
        return (
            <TouchableOpacity style={styles.toggleButton} onPress={() => setVisible(true)}>
                <Text style={styles.toggleText}>DEV</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.panel}>
            <View style={styles.header}>
                <Text style={styles.title}>Mode Dev</Text>
                <TouchableOpacity onPress={() => setVisible(false)}>
                    <Text style={styles.closeButton}>X</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.placingSelector}>
                <TouchableOpacity
                    style={[styles.placingButton, placing === 'player:1' && styles.placingActiveP1]}
                    onPress={() => setPlacing('player:1')}
                >
                    <Text>J1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.placingButton, placing === 'player:2' && styles.placingActiveP2]}
                    onPress={() => setPlacing('player:2')}
                >
                    <Text>J2</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.hint}>Cliquez sur une case pour placer/retirer un pion :</Text>

            <View style={styles.devGrid}>
                {grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.devRow}>
                        {row.map((cell, cellIndex) => (
                            <TouchableOpacity
                                key={cellIndex}
                                style={[
                                    styles.devCell,
                                    cell.owner === 'player:1' && styles.cellP1,
                                    cell.owner === 'player:2' && styles.cellP2,
                                ]}
                                onPress={() => handleDevPlace(rowIndex, cellIndex)}
                            >
                                <Text style={styles.devCellText}>
                                    {cell.owner === 'player:1' ? 'J1' : cell.owner === 'player:2' ? 'J2' : '.'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    toggleButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#333',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 100,
    },
    toggleText: {
        color: '#0f0',
        fontSize: 10,
        fontWeight: 'bold',
    },
    panel: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 10,
        borderRadius: 8,
        zIndex: 100,
        minWidth: 220,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        color: '#0f0',
        fontWeight: 'bold',
        fontSize: 14,
    },
    closeButton: {
        color: '#f00',
        fontWeight: 'bold',
        fontSize: 16,
    },
    placingSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 8,
    },
    placingButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#555',
    },
    placingActiveP1: {
        backgroundColor: 'lightgreen',
    },
    placingActiveP2: {
        backgroundColor: 'lightcoral',
    },
    hint: {
        color: '#aaa',
        fontSize: 10,
        marginBottom: 6,
    },
    devGrid: {
        flexDirection: 'column',
        gap: 2,
    },
    devRow: {
        flexDirection: 'row',
        gap: 2,
    },
    devCell: {
        width: 34,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#444',
        borderRadius: 2,
    },
    cellP1: {
        backgroundColor: 'green',
    },
    cellP2: {
        backgroundColor: 'red',
    },
    devCellText: {
        color: '#fff',
        fontSize: 9,
    },
});

export default DevPanel;
