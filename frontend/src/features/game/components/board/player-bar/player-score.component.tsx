import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from "@/shared/contexts/socket.context";
import type { Socket } from "socket.io-client";
import type { ScoreViewStatePayload } from "@shared/types/socket-events.types";

const PlayerScore: React.FC = () => {
  const socket = useContext(SocketContext) as Socket;
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const onScore = (data: ScoreViewStatePayload): void => {
      setScore(data.playerScore);
    };
    socket.on("game.score", onScore);
    return () => { socket.off("game.score", onScore); };
  }, []);

  return (
    <View style={styles.playerScoreContainer}>
      <Text style={styles.scoreText}>Score: {score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  playerScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "lightgrey"
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PlayerScore;
