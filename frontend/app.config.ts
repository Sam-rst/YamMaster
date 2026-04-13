import { ExpoConfig, ConfigContext } from 'expo/config';
import { version } from '../version.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'YamMaster',
  slug: 'yammaster',
  version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'yammaster',
  platforms: ['ios', 'android', 'web'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.samrst.yammaster',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0D0F1A',
    },
    package: 'com.samrst.yammaster',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  updates: {
    url: 'https://u.expo.dev/7a1bd324-603d-4b05-8bbc-1e263cf8e442',
  },
  extra: {
    serverUrl: process.env.EXPO_PUBLIC_SERVER_URL || '',
    eas: {
      projectId: '7a1bd324-603d-4b05-8bbc-1e263cf8e442',
    },
  },
  owner: 'samrst',
});
