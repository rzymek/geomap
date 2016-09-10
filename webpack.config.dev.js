const webpack = require('webpack');
const prodConfig = require('./webpack.config.prod');
const _ = require('lodash');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const devEntries = [
    'webpack-hot-middleware/client'
];

// replace scss loaders for hot-module-reload compatible ones
const devModule = _.assign(prodConfig, {
    loaders: prodConfig.module.loaders.map(loader => {
        if ('test.scss'.match(loader.test)) {
            return {
                test: loader.test,
                loaders: ["style", "css?sourceMap", "postcss", "sass?sourceMap"]
            };
        } else if ('test.css'.match(loader.test)) {
            return {
                test: loader.test,
                loaders: ["style", "css?sourceMap", "postcss"]
            };
        } else {
            return loader;
        }
    })
});
module.exports = _.chain(prodConfig).assign({
    devtool: 'source-map',
    entry: _.mapValues(prodConfig.entry, v => [...v, ...devEntries]),
    output: _.assign(prodConfig.output, {
        /* In dev mode, CSS in bundled in JS,
         images and fonts are not (as in prod).
         This causes a problem with url() in css.
         As the css's baseUrl is blob:... then event absolute path don't work - host name is also needed.
         */
        publicPath: 'http://localhost:3000/js/'
    }),
    plugins: [
        new ExtractTextPlugin("[name].css", {
            disable: true
        }),
        new webpack.DefinePlugin({
            PRODUCTION: false
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    module: devModule
}).value();