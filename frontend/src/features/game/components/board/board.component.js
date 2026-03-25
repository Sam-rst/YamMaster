// app/components/board/board.component.js

import React from "react";
import { View, StyleSheet } from 'react-native';
import PlayerTimer from "../player-bar/player-timer.component";
import OpponentTimer from "../player-bar/opponent-timer.component";
import OpponentDeck from "../dice/opponent-deck.component";
import PlayerDeck from "../dice/player-deck.component";
import Choices from "../choices/choices.component";
import Grid from "../grid/grid.component";
import OpponentScore from "../player-bar/opponent-score.component";
import PlayerScore from "../player-bar/player-score.component";
import PlayerInfos from "../player-bar/player-infos.component";
import OpponentInfos from "../player-bar/opponent-infos.component";
import PlayerTokens from "../player-bar/player-tokens.component";
import OpponentTokens from "../player-bar/opponent-tokens.component";
import DevPanel from "../dev/dev-panel.component";
import { DEV_MODE } from "@/shared/services/config";


const Board = ({ _gameViewState}) => {
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
