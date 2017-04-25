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
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
            "openlayers/css/ol.css": __dirname + "/node_modules/openlayers/dist/ol-debug.css",
            "openlayers": __dirname + "/node_modules/openlayers/dist/ol-debug.js",
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        ...CHUNKS.map(name => htmlForChunk(name))
    ],
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader' },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] }
        ]
    }
};
