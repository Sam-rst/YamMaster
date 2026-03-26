import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from "@/shared/contexts/socket.context";
import type { Socket } from "socket.io-client";
import type { ScoreViewStatePayload } from "@shared/types/socket-events.types";

const OpponentTokens: React.FC = () => {
  const socket = useContext(SocketContext) as Socket;
  const [tokens, setTokens] = useState<number>(12);

  useEffect(() => {
    const onScore = (data: ScoreViewStatePayload): void => {
      setTokens(data.opponentTokens);
    };
    socket.on("game.score", onScore);
    return () => { socket.off("game.score", onScore); };
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
