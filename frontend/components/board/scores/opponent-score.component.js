import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const OpponentScore = () => {
  const socket = useContext(SocketContext);
  const [score, setScore] = useState(0);

  useEffect(() => {
    socket.on("game.score", (data) => {
      setScore(data.opponentScore);
    });
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
