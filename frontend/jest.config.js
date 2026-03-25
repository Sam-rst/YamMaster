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
        '^react-native$': '<rootDir>/src/__mocks__/react-native.mock.js',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/features/**/*.js',
        'src/shared/**/*.js',
        '!**/*.test.js',
    ],
};
