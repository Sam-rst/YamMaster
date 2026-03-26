// app/components/board/decks/dice.component.tsx

import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

interface DiceProps {
  index?: number;
  locked: boolean;
  value: string;
  onPress?: (index: number) => void;
  opponent?: boolean;
}

const Dice: React.FC<DiceProps> = ({ index, locked, value, onPress, opponent }) => {

  const handlePress = (): void => {
    if (!opponent && onPress && index !== undefined) {
      onPress(index);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.dice, locked && styles.lockedDice]}
      onPress={handlePress}
      disabled={opponent}
    >
      <Text style={styles.diceText}>{value}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dice: {
    width: 40,
    height: 40,
    backgroundColor: "lightblue",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedDice: {
    backgroundColor: "gray",
  },
  diceText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  opponentText: {
    fontSize: 12,
    color: "red",
  },
});

export default Dice;
