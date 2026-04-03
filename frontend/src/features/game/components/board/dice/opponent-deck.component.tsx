// frontend/src/features/game/components/board/dice/opponent-deck.component.tsx

import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SocketContext } from '@/shared/contexts/socket.context';
import Dice from './die.component';
import type { Socket } from 'socket.io-client';
import type { Dice as DiceType } from '@shared/types/game.types';

interface OpponentDeckViewStateData {
    displayOpponentDeck: boolean;
    dices: DiceType[];
}

const OpponentDeck: React.FC = () => {
    const socket = useContext(SocketContext) as Socket;
    const [displayOpponentDeck, setDisplayOpponentDeck] = useState<boolean>(false);
    const [opponentDices, setOpponentDices] = useState<DiceType[]>(new Array(5).fill({ value: '', locked: false }));

    useEffect(() => {
        const onDeckViewState = (data: OpponentDeckViewStateData): void => {
            setDisplayOpponentDeck(data['displayOpponentDeck']);
            if (data['displayOpponentDeck']) {
                setOpponentDices(data['dices']);
            }
        };
        socket.on('game.deck.view-state', onDeckViewState);
        return () => { socket.off('game.deck.view-state', onDeckViewState); };
    }, []);

    return (
        <View style={styles.container}>
            {displayOpponentDeck && (
                <View style={styles.diceRow}>
                    {opponentDices.map((diceData: DiceType, dicePosition: number) => (
                        <Dice
                            key={`opponent-die-${dicePosition}`}
                            locked={diceData.locked}
                            value={diceData.value}
                            opponent={true}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        opacity: 0.5,
    },
    diceRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
});

export default OpponentDeck;
