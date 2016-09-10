const path = require('path');
const _ = require("lodash");
const webpackConfig = require('./webpack.config.dev.js');

module.exports = function (config) {
    config.set({
        basePath: 'src',
        frameworks: ['mocha', 'chai'],
        files: [
            'tests/**/*.ts',
            'tests/**/*.tsx'
        ],
        exclude: [],
        preprocessors: {
            '**/*.tsx': ['webpack'/*,'sourcemap'*/],
            '**/*.ts': ['webpack'],
        },
        webpack: {
            devtool: 'cheap-module-source-map',
            module: webpackConfig.module,
            resolve: webpackConfig.resolve,
            externals: {
                'cheerio': 'window',
                'react/addons': true,
                'react/lib/ExecutionEnvironment': true,
                'react/lib/ReactContext': true
            }
        },
        reporters: ['progress','junit'],
        junitReporter: {
          outputFile: path.resolve(__dirname, '../target/karma-reports', 'karma-test-results.xml')
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false,
        concurrency: Infinity
    })
};