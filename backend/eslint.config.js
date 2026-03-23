module.exports = [
    {
        ignores: ['node_modules/**', 'coverage/**'],
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
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                process: 'readonly',
                console: 'readonly',
                __dirname: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                setTimeout: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                jest: 'readonly',
            },
        },
    },
];
