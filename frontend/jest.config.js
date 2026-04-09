module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        String.raw`node_modules/(?!(react-native|@react-native|@react-navigation|expo(-[^/]+)?|@expo|socket\.io-client|engine\.io-client)/)`,
    ],
    setupFiles: ['./jest.setup.js'],
    testPathIgnorePatterns: ['/node_modules/', '/__tests__/helpers/'],
    moduleNameMapper: {
        '^react-native$': '<rootDir>/src/__mocks__/react-native.mock.js',
        '^expo-constants$': '<rootDir>/src/__mocks__/expo-constants.mock.js',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@shared/(.*)$': '<rootDir>/../shared/$1',
    },
    collectCoverageFrom: [
        'src/features/**/*.{js,ts,tsx}',
        'src/shared/**/*.{js,ts,tsx}',
        '!**/*.test.{js,ts,tsx}',
    ],
    coverageThreshold: {
        global: {
            statements: 90,
            branches: 80,
            functions: 90,
            lines: 90,
        },
    },
};
