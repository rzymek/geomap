const path = require('path');
const _ = require("lodash");
const webpackConfig = require('./webpack.config.dev.js');
/*
 "chai": "^3.5.0",
 "enzyme": "^2.4.1",
 "karma": "^1.1.1",
 "karma-chai": "^0.1.0",
 "karma-junit-reporter": "^1.1.0",
 "karma-mocha": "^1.1.1",
 "karma-phantomjs-launcher": "^1.0.1",
 "karma-typescript-preprocessor2": "^1.2.1",
 "karma-webpack": "^1.7.0",
 "mocha": "^2.5.3",
 "phantomjs-prebuilt": "^2.1.7",
 "react-addons-test-utils": "^15.2.1",
 */
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