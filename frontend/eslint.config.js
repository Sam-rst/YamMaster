module.exports = [
    {
        ignores: ['node_modules/**', 'coverage/**', '__mocks__/**', 'dist/**', 'jest.setup.js'],
    },
    {
        files: ['**/*.js'],
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-const-assign': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'eqeqeq': 'warn',
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
