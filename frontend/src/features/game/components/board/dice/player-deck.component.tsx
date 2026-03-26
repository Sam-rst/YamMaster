// app/components/board/decks/player-deck.component.tsx
// Zéro logique métier — affiche les dés et émet les actions

import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SocketContext } from "@/shared/contexts/socket.context";
import Dice from "./die.component";
import type { Socket } from "socket.io-client";
import type { Dice as DiceType } from "@shared/types/game.types";

interface DeckViewStateData {
  displayPlayerDeck: boolean;
  displayRollButton: boolean;
  rollsCounter: number;
  rollsMaximum: number;
  dices: DiceType[];
  canRoll: boolean;
  canLockDice: boolean;
}

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
    socket.on("game.deck.view-state", onDeckViewState);
    return () => { socket.off("game.deck.view-state", onDeckViewState); };
  }, []);

  const toggleDiceLock = (index: number): void => {
    if (canLockDice) {
      socket.emit("game.dices.lock", dices[index].id);
    }
  };

  const rollDices = (): void => {
    if (canRoll) {
      socket.emit("game.dices.roll");
    }
  };

  return (
    <View style={styles.deckPlayerContainer}>
      {displayPlayerDeck && (
        <>
          {displayRollButton && (
            <View style={styles.rollInfoContainer}>
              <Text style={styles.rollInfoText}>
                Lancer {rollsCounter} / {rollsMaximum}
              </Text>
            </View>
          )}

          <View style={styles.diceContainer}>
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
            <TouchableOpacity
              style={[styles.rollButton, !canRoll && styles.rollButtonDisabled]}
              onPress={rollDices}
              disabled={!canRoll}
            >
              <Text style={styles.rollButtonText}>Roll</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  deckPlayerContainer: {
    flex: 1, justifyContent: "center", alignItems: "center",
    borderBottomWidth: 1, borderColor: "black"
  },
  rollInfoContainer: { marginBottom: 10 },
  rollInfoText: { fontSize: 14, fontStyle: "italic" },
  diceContainer: {
    flexDirection: "row", width: "70%",
    justifyContent: "space-between", marginBottom: 10,
  },
  rollButton: {
    width: "30%", backgroundColor: "black", paddingVertical: 10,
    borderRadius: 5, justifyContent: "center", alignItems: "center",
  },
  rollButtonDisabled: { opacity: 0.5 },
  rollButtonText: { fontSize: 18, color: "white", fontWeight: "bold" },
});

export default PlayerDeck;
