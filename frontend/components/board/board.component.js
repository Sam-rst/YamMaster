// app/components/board/board.component.js

import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import PlayerTimer from "./timers/player-timer.component";
import OpponentTimer from "./timers/oppenent-timer.component";
import OpponentDeck from "./decks/opponent-deck.component";
import PlayerDeck from "./decks/player-deck.component";
import Choices from "./choices/choices.component";
import Grid from "./grid/grid.component";
import OpponentScore from "./scores/opponent-score.component";
import PlayerScore from "./scores/player-score.component";
import PlayerInfos from "./infos/player-infos.component";
import OpponentInfos from "./infos/opponent-infos.component";
import PlayerTokens from "./tokens/player-tokens.component";
import OpponentTokens from "./tokens/opponent-tokens.component";
import DevPanel from "./dev/dev-panel.component";
import { DEV_MODE } from "../../config";


const Board = ({ gameViewState}) => {
  return (
    <View style={styles.container}>
      {DEV_MODE && <DevPanel />}
      <View style={[styles.row, { height: '8%' }]}>
        <OpponentInfos />
        <View style={styles.opponentStatsContainer}>
          <OpponentTimer />
          <OpponentScore />
          <OpponentTokens />
        </View>
      </View>
      <View style={[styles.row, { height: '22%' }]}>
        <OpponentDeck />
      </View>
      <View style={[styles.row, { height: '40%' }]}>
        <Grid />
        <Choices />
      </View>
      <View style={[styles.row, { height: '22%' }]}>
        <PlayerDeck />
      </View>
      <View style={[styles.row, { height: '8%' }]}>
        <PlayerInfos />
        <View style={styles.playerStatsContainer}>
          <PlayerTimer />
          <PlayerScore />
          <PlayerTokens />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  opponentStatsContainer: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: "lightgrey"
  },
  playerStatsContainer: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: "lightgrey"
  },
});

export default Board;
