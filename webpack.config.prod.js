const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const target = process.env.OUTDIR || path.join(__dirname, 'dist');

module.exports = {
    entry: {
        bundle: ['./src/index']
    },
    output: {
        path: target,
        filename: '[name].js',
        publicPath: '/js/'
    },
    resolve: {
        root: ['src', 'node_modules'].map(function (dir) {
            return path.resolve(__dirname, dir)
        }),
        extensions: ['', '.js', '.ts', '.tsx', '.jsx']
    },
    plugins: [
        new ExtractTextPlugin("[name].css", {
            allChunks: true
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            },
            PRODUCTION: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            },
            sourceMap: false
        })
    ],
    postcss() {
        /* enable postcss autoprefixed plugin (adds -webkit- and other prefixes)*/
        return [autoprefixer];
    },
    module: {
        loaders: [{
            test: /\.tsx?$/,
            loaders: ['ts-loader'],
            include: path.join(__dirname, 'src')
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract(["css", "postcss"])
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract(["css", "postcss!sass"])
        }, {
            test: /\.svg$/,
            loader: 'file?name=[path][name].[ext]?[hash]&context=src/scss',
            include: [path.resolve(__dirname, "src/scss/images")]
        }, {
            test: /\.(woff|woff2|eot|ttf|svg)$/,
            loader: 'file?name=[path][name].[ext]&context=src/scss',
            include: [path.resolve(__dirname, "src/scss/fonts")]
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
        "react": "React",
        "react-dom": "ReactDOM"
    },
};
