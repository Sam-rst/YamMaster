import { Platform } from 'react-native';

export const fontDisplay = Platform.select({
    web: '"Outfit", sans-serif',
    default: 'Outfit',
});

export const fontSans = Platform.select({
    web: '"Inter", sans-serif',
    default: 'Inter',
});
