// app/screens/home.screen.tsx

import React from "react";
import { StyleSheet, View, Button } from "react-native";

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <View>
        <Button
          title="Jouer en ligne"
          onPress={() => navigation.navigate('OnlineGameScreen')}
        />
      </View>
      <View>
        <Button
          title="Jouer contre le bot"
          onPress={() => navigation.navigate('VsBotGameScreen')}
        />
      </View>
      <View>
        <Button
          title="Historique"
          onPress={() => navigation.navigate('HistoryScreen')}
        />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  }
});
