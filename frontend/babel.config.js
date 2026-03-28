module.exports = {
    presets: ['@react-native/babel-preset'],
    plugins: [
        ['module-resolver', {
            root: ['./src'],
            alias: {
                '@': './src',
                '@shared': '../shared',
            },
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        }],
    ],
};
