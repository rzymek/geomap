const path = require('path');
// const fs = require('fs');
const webpack = require('webpack');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CHUNKS = ['index', 'fetch'];

function htmlForChunk(name) {
    return new HtmlWebpackPlugin({
        filename: `${name}.html`,
        template: 'src/template.html',
        chunks: [name]
    })
}
module.exports = {
    devtool: 'cheap-source-map',
    entry: CHUNKS.reduce((dict, name) => (dict[name] = `./src/${name}`, dict), {}),
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        ...CHUNKS.map(name => htmlForChunk(name))
    ],
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader' },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] }
        ]
    }
};
