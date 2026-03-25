module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|socket\\.io-client|engine\\.io-client)/)',
    ],
    setupFiles: ['./jest.setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    moduleNameMapper: {
        '^react-native$': '<rootDir>/__mocks__/react-native.mock.js',
    },
    collectCoverageFrom: [
        'features/**/*.js',
        'shared/**/*.js',
        '!**/*.test.js',
    ],
};
