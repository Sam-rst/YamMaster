// ./App.tsx

import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/features/home/screens/home.screen';
import AuthScreen from '@/features/auth/screens/auth.screen';
import { SocketProvider } from '@/shared/contexts/socket.context';
import { AuthProvider } from '@/shared/contexts/auth.context';
import OnlineGameScreen from '@/features/game/screens/online-game.screen';
import VsBotGameScreen from '@/features/game/screens/vs-bot-game.screen';
import HistoryScreen from '@/features/history/screens/history.screen';

type RootStackParamList = {
  AuthScreen: undefined;
  HomeScreen: undefined;
  OnlineGameScreen: undefined;
  VsBotGameScreen: undefined;
  HistoryScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
LogBox.ignoreAllLogs(true);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="AuthScreen">
            <Stack.Screen name="AuthScreen" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="OnlineGameScreen" component={OnlineGameScreen} />
            <Stack.Screen name="VsBotGameScreen" component={VsBotGameScreen} />
            <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
