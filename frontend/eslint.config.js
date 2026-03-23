const reactPlugin = require('eslint-plugin-react');

module.exports = [
    {
        ignores: ['node_modules/**', 'coverage/**', '__mocks__/**', 'dist/**', 'jest.setup.js'],
    },
    {
        files: ['**/*.js'],
        plugins: {
            react: reactPlugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            'no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^React$',
            }],
            'no-undef': 'error',
            'no-const-assign': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'eqeqeq': 'warn',
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
                console: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                jest: 'readonly',
            },
        },
    },
];
