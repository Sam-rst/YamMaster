const tseslint = require('typescript-eslint');

module.exports = [
    {
        ignores: ['node_modules/**', 'coverage/**', 'dist/**', 'services/**', '*.js'],
    },
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-const-assign': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'eqeqeq': 'warn',
        },
    },
];
