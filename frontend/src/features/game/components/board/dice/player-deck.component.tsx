// frontend/src/features/game/components/board/dice/player-deck.component.tsx
// Zéro logique métier — affiche les dés et émet les actions

import React, { useState, useContext, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SocketContext } from '@/shared/contexts/socket.context';
import Dice from './die.component';
import { colors } from '@/shared/theme/colors';
import type { Socket } from 'socket.io-client';
import type { Dice as DiceType } from '@shared/types/game.types';

interface DeckViewStateData {
    displayPlayerDeck: boolean;
    displayRollButton: boolean;
    rollsCounter: number;
    rollsMaximum: number;
    dices: DiceType[];
    canRoll: boolean;
    canLockDice: boolean;
}

const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

const PlayerDeck: React.FC = () => {
    const socket = useContext(SocketContext) as Socket;
    const [displayPlayerDeck, setDisplayPlayerDeck] = useState<boolean>(false);
    const [dices, setDices] = useState<DiceType[]>(Array(5).fill(false));
    const [displayRollButton, setDisplayRollButton] = useState<boolean>(false);
    const [rollsCounter, setRollsCounter] = useState<number>(0);
    const [rollsMaximum, setRollsMaximum] = useState<number>(3);
    const [canRoll, setCanRoll] = useState<boolean>(false);
    const [canLockDice, setCanLockDice] = useState<boolean>(false);

    useEffect(() => {
        const onDeckViewState = (data: DeckViewStateData): void => {
            setDisplayPlayerDeck(data.displayPlayerDeck);
            if (data.displayPlayerDeck) {
                setDisplayRollButton(data.displayRollButton);
                setRollsCounter(data.rollsCounter);
                setRollsMaximum(data.rollsMaximum);
                setDices(data.dices);
                setCanRoll(data.canRoll);
                setCanLockDice(data.canLockDice);
            }
        };
        socket.on('game.deck.view-state', onDeckViewState);
        return () => { socket.off('game.deck.view-state', onDeckViewState); };
    }, []);

    const toggleDiceLock = (index: number): void => {
        if (canLockDice) {
            socket.emit('game.dices.lock', dices[index].id);
        }
    };

    const rollDices = (): void => {
        if (canRoll) {
            socket.emit('game.dices.roll');
        }
    };

    return (
        <View style={styles.container}>
            {displayPlayerDeck && (
                <>
                    <View style={styles.diceRow}>
                        {dices.map((diceData: DiceType, index: number) => (
                            <Dice
                                key={diceData.id}
                                index={index}
                                locked={diceData.locked}
                                value={diceData.value}
                                onPress={toggleDiceLock}
                            />
                        ))}
                    </View>

                    {displayRollButton && (
                        <View style={styles.rollRow}>
                            <View style={styles.rollCounter}>
                                <Text style={styles.rollLabel}>Lancer</Text>
                                <Text style={styles.rollValue}>{rollsCounter}/{rollsMaximum}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.rollButtonWrapper}
                                onPress={rollDices}
                                disabled={!canRoll}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={canRoll
                                        ? [colors.primary, '#c23152']
                                        : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.rollButton}
                                >
                                    <Text style={[
                                        styles.rollButtonText,
                                        !canRoll && styles.rollButtonTextDisabled,
                                    ]}>
                                        Lancer les dés
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        gap: 16,
    },
    diceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    rollRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rollCounter: {
        alignItems: 'center',
    },
    rollLabel: {
        fontFamily: fontSans,
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    rollValue: {
        fontFamily: fontDisplay,
        fontSize: 22,
        fontWeight: '900',
        color: colors.primary,
    },
    rollButtonWrapper: {
        flex: 1,
    },
    rollButton: {
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rollButtonText: {
        fontFamily: fontDisplay,
        fontSize: 16,
        fontWeight: '900',
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    rollButtonTextDisabled: {
        color: 'rgba(255,255,255,0.2)',
    },
});

export default PlayerDeck;
