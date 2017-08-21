var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry: {
        rendering: './src/annotations-rendering.js',
        editing: './src/annotations-editing.js',
    },
    output: {
        filename: '[name].js',
        libraryTarget: "umd",
        path: __dirname + '/dist'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                },
                exclude: '/node_modules/'
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};