// ./App.tsx

import React from 'react';
import { LogBox, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';
import HomeScreen from '@/features/home/screens/home.screen';
import AuthScreen from '@/features/auth/screens/auth.screen';
import { SocketProvider } from '@/shared/contexts/socket.context';
import { AuthProvider } from '@/shared/contexts/auth.context';
import OnlineGameScreen from '@/features/game/screens/online-game.screen';
import VsBotGameScreen from '@/features/game/screens/vs-bot-game.screen';
import HistoryScreen from '@/features/history/screens/history.screen';
import ReplayScreen from '@/features/replay/screens/replay.screen';
import { colors } from '@/shared/theme/colors';

type RootStackParamList = {
  AuthScreen: undefined;
  HomeScreen: undefined;
  OnlineGameScreen: undefined;
  VsBotGameScreen: undefined;
  HistoryScreen: undefined;
  ReplayScreen: { gameId: string };
};

const Stack = createStackNavigator<RootStackParamList>();
LogBox.ignoreAllLogs(true);

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Outfit_700Bold,
    Outfit: Outfit_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="AuthScreen">
            <Stack.Screen name="AuthScreen" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OnlineGameScreen" component={OnlineGameScreen} />
            <Stack.Screen name="VsBotGameScreen" component={VsBotGameScreen} />
            <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
            <Stack.Screen name="ReplayScreen" component={ReplayScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
