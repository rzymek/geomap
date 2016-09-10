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
    entry: CHUNKS.reduce((dict, name) => (dict[name] = `./src/${name}.tsx`, dict), {}),
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        // root: ['src', 'node_modules'].map(function (dir) {
        //     return path.resolve(__dirname, dir)
        // }),
        extensions: ['', '.js', '.ts', '.tsx']
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        // new webpack.optimize.UglifyJsPlugin({
        //     compressor: {
        //         warnings: false
        //     }
        // }),
        ...CHUNKS.map(name => htmlForChunk(name))
    ],
    module: {
        loaders: [{
            test: /\.tsx?$/,
            loaders: ['ts-loader']

            // ,include: path.join(__dirname, 'src')
        }],
        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {test: /\.js$/, loader: "source-map-loader"}
        ]
    },
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "lodash": "_",
        "react": "React",
        "react-dom": "ReactDOM"
    },
};
