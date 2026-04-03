// ./App.tsx

import React from 'react';
import { LogBox, ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import BotDifficultyScreen from '@/features/game/screens/bot-difficulty.screen';
import HistoryScreen from '@/features/history/screens/history.screen';
import ReplayScreen from '@/features/replay/screens/replay.screen';
import RulesScreen from '@/features/rules/screens/rules.screen';
import ProfileScreen from '@/features/profile/screens/profile.screen';
import { colors } from '@/shared/theme/colors';

type RootStackParamList = {
  AuthScreen: undefined;
  MainTabs: undefined;
};

type HomeStackParamList = {
  HomeScreen: undefined;
  OnlineGameScreen: undefined;
  BotDifficultyScreen: undefined;
  VsBotGameScreen: { difficulty: string };
  HistoryScreen: undefined;
  ReplayScreen: { gameId: string };
};

const SCREENS_WITHOUT_TAB_BAR = ['OnlineGameScreen', 'BotDifficultyScreen', 'VsBotGameScreen', 'ReplayScreen'];

const RootStack = createStackNavigator<RootStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator();

LogBox.ignoreAllLogs(true);

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    <HomeStack.Screen name="OnlineGameScreen" component={OnlineGameScreen} />
    <HomeStack.Screen name="BotDifficultyScreen" component={BotDifficultyScreen} />
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
    <Tab.Screen
      name="Profil"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
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

  const fontDisplay = Platform.select({ web: '"Outfit", sans-serif', default: 'Outfit' });
  const fontSans = Platform.select({ web: '"Inter", sans-serif', default: 'Inter' });

  if (!fontsLoaded) {
    return (
      <View style={splashStyles.container}>
        <LinearGradient
          colors={['rgba(233, 69, 96, 0.15)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={splashStyles.gradientTopLeft}
        />
        <LinearGradient
          colors={['rgba(83, 52, 131, 0.15)', 'transparent']}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={splashStyles.gradientBottomRight}
        />

        <View style={splashStyles.content}>
          <Text style={[splashStyles.title, { fontFamily: fontDisplay }]}>YAM</Text>
          <Text style={[splashStyles.subtitle, { fontFamily: fontSans }]}>Yam Master</Text>
          <Text style={[splashStyles.tagline, { fontFamily: fontSans }]}>Que le duel commence !</Text>

          <View style={splashStyles.loaderContainer}>
            <View style={splashStyles.loaderTrack}>
              <ActivityIndicator size="small" color={colors.primary} style={splashStyles.spinner} />
              <View style={splashStyles.loaderBar} />
            </View>
            <Text style={[splashStyles.loaderText, { fontFamily: fontSans }]}>
              Préparation du plateau...
            </Text>
          </View>
        </View>

        <Text style={[splashStyles.footer, { fontFamily: fontSans }]}>Est. 2024</Text>
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

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  gradientBottomRight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  loaderTrack: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderBar: {
    width: '60%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  spinner: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
  },
  loaderText: {
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
