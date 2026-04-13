// frontend/config.ts
// Configuration centralisee — lit les variables depuis env ou expo-constants

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getServerUrl = (): string => {
    const fromEnv = process.env.EXPO_PUBLIC_SERVER_URL || '';
    if (fromEnv) return fromEnv;

    const fromConstants = Constants.expoConfig?.extra?.serverUrl || '';
    if (fromConstants) return fromConstants;

    const host = Platform.OS === 'web'
        ? (process.env.EXPO_PUBLIC_SERVER_HOST_WEB || 'localhost')
        : (process.env.EXPO_PUBLIC_SERVER_HOST_MOBILE || 'localhost');
    const port = process.env.EXPO_PUBLIC_SERVER_PORT || '3000';
    return `http://${host}:${port}`;
};

export const SERVER_URL: string = getServerUrl();

export const DEV_MODE: boolean = process.env.EXPO_PUBLIC_DEV_MODE === 'true';
