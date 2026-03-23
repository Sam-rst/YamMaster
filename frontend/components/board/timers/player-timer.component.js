// app/components/board/timers/player-timer.component.js

import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../../contexts/socket.context";
import { StyleSheet, Text, View } from "react-native";

const PlayerTimer = () => {
  const socket = useContext(SocketContext);
  const [playerTimer, setPlayerTimer] = useState(0);

  useEffect(() => {
    const onTimer = (data) => {
      setPlayerTimer(data['playerTimer']);
    };
    socket.on("game.timer", onTimer);
    return () => socket.off("game.timer", onTimer);
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