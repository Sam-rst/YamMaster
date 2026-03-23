import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const OpponentTokens = () => {
  const socket = useContext(SocketContext);
  const [tokens, setTokens] = useState(12);

  useEffect(() => {
    const onScore = (data) => {
      setTokens(data.opponentTokens);
    };
    socket.on("game.score", onScore);
    return () => socket.off("game.score", onScore);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Jetons: {tokens}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
  },
});

export default OpponentTokens;
