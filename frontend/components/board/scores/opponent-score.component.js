import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const OpponentScore = () => {
  const socket = useContext(SocketContext);
  const [score, setScore] = useState(0);
  const [tokens, setTokens] = useState(12);

  useEffect(() => {
    socket.on("game.score", (data) => {
      setScore(data.opponentScore);
      setTokens(data.opponentTokens);
    });
  }, []);

  return (
    <View style={styles.opponentScoreContainer}>
      <Text style={styles.scoreText}>Score: {score}</Text>
      <Text style={styles.tokensText}>Jetons: {tokens}</Text>
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
  tokensText: {
    fontSize: 11,
  },
});

export default OpponentScore;
