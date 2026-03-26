// app/components/board/timers/opponent-timer.component.tsx

import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "@/shared/contexts/socket.context";
import { StyleSheet, View, Text } from "react-native";
import type { Socket } from "socket.io-client";
import type { TimerPayload } from "@shared/types/socket-events.types";

const OpponentTimer: React.FC = () => {
  const socket = useContext(SocketContext) as Socket;
  const [opponentTimer, setOpponentTimer] = useState<number>(0);

  useEffect(() => {
    const onTimer = (data: TimerPayload): void => {
      setOpponentTimer(data['opponentTimer']);
    };
    socket.on("game.timer", onTimer);
    return () => { socket.off("game.timer", onTimer); };
  }, []);
  return (
    <View style={styles.opponentTimerContainer}>
      <Text>Timer: {opponentTimer}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  opponentTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OpponentTimer;
