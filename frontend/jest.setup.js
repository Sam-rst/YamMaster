// Silence les logs pendant les tests
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
};

// Mock global expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
    const mockReact = require('react');
    return {
        LinearGradient: ({ children, ...props }) =>
            mockReact.createElement('div', { 'data-testid': 'linear-gradient', ...props }, children),
    };
});

// Mock global react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
    const mockReact = require('react');
    return {
        SafeAreaView: ({ children, ...props }) =>
            mockReact.createElement('div', { 'data-testid': 'safe-area-view', ...props }, children),
        SafeAreaProvider: ({ children }) => children,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
});

// Mock global @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const mockReact = require('react');
    return {
        Feather: ({ name, ...props }) =>
            mockReact.createElement('span', { 'data-testid': `icon-${name}`, ...props }),
    };
});
