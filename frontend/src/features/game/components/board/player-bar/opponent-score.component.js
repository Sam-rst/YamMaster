import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from "@/shared/contexts/socket.context";

const OpponentScore = () => {
  const socket = useContext(SocketContext);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const onScore = (data) => {
      setScore(data.opponentScore);
    };
    socket.on("game.score", onScore);
    return () => socket.off("game.score", onScore);
  }, []);

  return (
    <View style={styles.opponentScoreContainer}>
      <Text style={styles.scoreText}>Score: {score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  opponentScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default OpponentScore;
