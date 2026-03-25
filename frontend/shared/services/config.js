// frontend/config.js
// Configuration centralisée — lit les variables depuis .env (EXPO_PUBLIC_*)

import { Platform } from 'react-native';

// Si une URL complète est fournie (ex: https://yammaster-backend-dev.onrender.com), l'utiliser directement
// Sinon construire l'URL à partir de host + port (mode dev local)
const SERVER_URL_OVERRIDE = process.env.EXPO_PUBLIC_SERVER_URL || '';

const SERVER_HOST_WEB = process.env.EXPO_PUBLIC_SERVER_HOST_WEB || 'localhost';
const SERVER_HOST_MOBILE = process.env.EXPO_PUBLIC_SERVER_HOST_MOBILE || '10.61.8.6';
const SERVER_PORT = process.env.EXPO_PUBLIC_SERVER_PORT || '3000';

export const SERVER_URL = SERVER_URL_OVERRIDE
    || (Platform.OS === 'web'
        ? `http://${SERVER_HOST_WEB}:${SERVER_PORT}`
        : `http://${SERVER_HOST_MOBILE}:${SERVER_PORT}`);

export const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE === 'true';
