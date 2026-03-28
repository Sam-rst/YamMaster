const reactPlugin = require('eslint-plugin-react');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

const sharedRules = {
    'no-const-assign': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'eqeqeq': 'warn',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
};

const sharedGlobals = {
    require: 'readonly',
    module: 'readonly',
    process: 'readonly',
    console: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    jest: 'readonly',
};

module.exports = [
    {
        ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'jest.setup.js', 'src/__mocks__/**'],
    },
    // JavaScript files
    {
        files: ['**/*.js'],
        plugins: {
            react: reactPlugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...sharedRules,
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^React$',
            }],
            'no-undef': 'error',
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: sharedGlobals,
        },
    },
    // TypeScript files
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            react: reactPlugin,
            '@typescript-eslint': tsPlugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: sharedGlobals,
        },
        rules: {
            ...sharedRules,
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^React$',
            }],
            '@typescript-eslint/no-explicit-any': 'error',
        },
    },
];
