import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const PlayerScore = () => {
  const socket = useContext(SocketContext);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const onScore = (data) => {
      setScore(data.playerScore);
    };
    socket.on("game.score", onScore);
    return () => socket.off("game.score", onScore);
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
