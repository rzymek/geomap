var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = {
    entry: {
        index: './src/entry/index.js',
        fetch: './src/entry/fetch.js'
    },
    output: {
        path: 'dist',
        filename: '[name].[hash].js'
    },
    module: {
        loaders: [
            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
    plugins: [
        new FaviconsWebpackPlugin({
            logo: './img/carte-topographique-300px.png',
            icons: {
                favicons: true
            }
        }),
        new HtmlWebpackPlugin({
            title: 'geomap',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            title: 'geomap',
            filename: 'fetch.html',
            chunks: ['fetch']
        })]
};