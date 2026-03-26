// app/components/board/decks/opponent-deck.component.tsx

import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { SocketContext } from "@/shared/contexts/socket.context";
import Dice from "./die.component";
import type { Socket } from "socket.io-client";
import type { Dice as DiceType } from "@shared/types/game.types";

interface OpponentDeckViewStateData {
  displayOpponentDeck: boolean;
  dices: DiceType[];
}

const OpponentDeck: React.FC = () => {
  const socket = useContext(SocketContext) as Socket;
  const [displayOpponentDeck, setDisplayOpponentDeck] = useState<boolean>(false);
  const [opponentDices, setOpponentDices] = useState<DiceType[]>(Array(5).fill({ value: "", locked: false }));

  useEffect(() => {
    const onDeckViewState = (data: OpponentDeckViewStateData): void => {
      setDisplayOpponentDeck(data['displayOpponentDeck']);
      if (data['displayOpponentDeck']) {
        setOpponentDices(data['dices']);
      }
    };
    socket.on("game.deck.view-state", onDeckViewState);
    return () => { socket.off("game.deck.view-state", onDeckViewState); };
  }, []);

  return (
    <View style={styles.deckOpponentContainer}>
      {displayOpponentDeck && (
        <View style={styles.diceContainer}>
          {opponentDices.map((diceData: DiceType, index: number) => (
            <Dice
              key={index}
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
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "black"
  },
  diceContainer: {
    flexDirection: "row",
    width: "70%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});

export default OpponentDeck;
