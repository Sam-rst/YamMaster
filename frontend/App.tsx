// ./App.tsx

import React from 'react';
import { LogBox, ActivityIndicator, View } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { Feather } from '@expo/vector-icons';
import HomeScreen from '@/features/home/screens/home.screen';
import AuthScreen from '@/features/auth/screens/auth.screen';
import { SocketProvider } from '@/shared/contexts/socket.context';
import { AuthProvider } from '@/shared/contexts/auth.context';
import OnlineGameScreen from '@/features/game/screens/online-game.screen';
import VsBotGameScreen from '@/features/game/screens/vs-bot-game.screen';
import HistoryScreen from '@/features/history/screens/history.screen';
import ReplayScreen from '@/features/replay/screens/replay.screen';
import RulesScreen from '@/features/rules/screens/rules.screen';
import { colors } from '@/shared/theme/colors';

type RootStackParamList = {
  AuthScreen: undefined;
  MainTabs: undefined;
};

type HomeStackParamList = {
  HomeScreen: undefined;
  OnlineGameScreen: undefined;
  VsBotGameScreen: undefined;
  HistoryScreen: undefined;
  ReplayScreen: { gameId: string };
};

const SCREENS_WITHOUT_TAB_BAR = ['OnlineGameScreen', 'VsBotGameScreen', 'ReplayScreen'];

const RootStack = createStackNavigator<RootStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator();

LogBox.ignoreAllLogs(true);

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    <HomeStack.Screen name="OnlineGameScreen" component={OnlineGameScreen} />
    <HomeStack.Screen name="VsBotGameScreen" component={VsBotGameScreen} />
    <HomeStack.Screen name="HistoryScreen" component={HistoryScreen} />
    <HomeStack.Screen name="ReplayScreen" component={ReplayScreen} />
  </HomeStack.Navigator>
);

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const focusedRoute = getFocusedRouteNameFromRoute(route);
      const isGameScreen = focusedRoute !== undefined && SCREENS_WITHOUT_TAB_BAR.includes(focusedRoute);

      return {
        headerShown: false,
        tabBarStyle: isGameScreen
          ? { display: 'none' }
          : {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              borderTopWidth: 1,
            },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      };
    }}
  >
    <Tab.Screen
      name="Accueil"
      component={HomeStackNavigator}
      options={{
        tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Règles"
      component={RulesScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

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
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="AuthScreen" component={AuthScreen} />
            <RootStack.Screen name="MainTabs" component={MainTabs} />
          </RootStack.Navigator>
        </NavigationContainer>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
