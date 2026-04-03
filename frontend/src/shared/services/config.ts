// frontend/config.ts
// Configuration centralisee — lit les variables depuis .env (EXPO_PUBLIC_*)

import { Platform } from 'react-native';

// Si une URL complete est fournie (ex: https://yammaster-backend-dev.onrender.com), l'utiliser directement
// Sinon construire l'URL a partir de host + port (mode dev local)
const SERVER_URL_OVERRIDE: string = process.env.EXPO_PUBLIC_SERVER_URL || '';

const SERVER_HOST_WEB: string = process.env.EXPO_PUBLIC_SERVER_HOST_WEB || 'localhost';
const SERVER_HOST_MOBILE: string = process.env.EXPO_PUBLIC_SERVER_HOST_MOBILE || 'localhost';
const SERVER_PORT: string = process.env.EXPO_PUBLIC_SERVER_PORT || '3000';

export const SERVER_URL: string = SERVER_URL_OVERRIDE
    || (Platform.OS === 'web'
        ? `http://${SERVER_HOST_WEB}:${SERVER_PORT}`
        : `http://${SERVER_HOST_MOBILE}:${SERVER_PORT}`);

export const DEV_MODE: boolean = process.env.EXPO_PUBLIC_DEV_MODE === 'true';
