// frontend/config.js
// Configuration centralisée de l'application

import { Platform } from 'react-native';

// Adresse du serveur WebSocket
const SERVER_HOST_MOBILE = '10.61.8.6'; // IP pour mobile physique / émulateur
const SERVER_HOST_WEB = 'localhost';
const SERVER_PORT = '3000';

export const SERVER_URL = Platform.OS === 'web'
    ? `http://${SERVER_HOST_WEB}:${SERVER_PORT}`
    : `http://${SERVER_HOST_MOBILE}:${SERVER_PORT}`;

// Mode développeur (affiche le panneau DEV dans le Board)
export const DEV_MODE = true;
