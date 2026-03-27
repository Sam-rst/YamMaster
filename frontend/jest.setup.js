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

// Mock global @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const mockReact = require('react');
    return {
        Feather: ({ name, ...props }) =>
            mockReact.createElement('span', { 'data-testid': `icon-${name}`, ...props }),
    };
});
