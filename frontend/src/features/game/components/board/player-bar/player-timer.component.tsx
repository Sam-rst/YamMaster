// app/components/board/timers/player-timer.component.tsx

import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "@/shared/contexts/socket.context";
import { StyleSheet, Text, View } from "react-native";
import type { Socket } from "socket.io-client";
import type { TimerPayload } from "@shared/types/socket-events.types";

const PlayerTimer: React.FC = () => {
  const socket = useContext(SocketContext) as Socket;
  const [playerTimer, setPlayerTimer] = useState<number>(0);

  useEffect(() => {
    const onTimer = (data: TimerPayload): void => {
      setPlayerTimer(data['playerTimer']);
    };
    socket.on("game.timer", onTimer);
    return () => { socket.off("game.timer", onTimer); };
  }, []);

  return (
    <View style={styles.playerTimerContainer}>
      <Text>Timer: {playerTimer}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  playerTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "lightgrey"
  }
});
export default PlayerTimer;
