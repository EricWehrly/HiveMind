const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
    {
        target: 'node',
        entry: './server/index.ts',
        output: {
            filename: 'server.js',
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.mjs'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        }
    },
    {
        target: 'web', // target should be 'web' for client-side bundle
        entry: './js/game.ts', // new entry point for the client bundle
        output: {
            filename: 'client.js', // output file for the client bundle
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.mjs'],
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'index.html',
                inject: true // change to 'true' to inject the client bundle into the HTML
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'js', to: 'js' },
                    { from: 'engine', to: 'engine' },
                    { from: 'css', to: 'css' },
                    // this fixes audio not loading properly but
                    // we don't fail gracefully if audio can't be found (I think)
                    // and I want to try to fix that before checking this in and forgetting
                    { from: 'audio', to: 'audio' },
                ]
            }),
        ]
    }
];
