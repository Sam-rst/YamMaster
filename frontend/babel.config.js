module.exports = {
    presets: ['babel-preset-expo'],
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
