const webpackConfig = require('./webpack.config.js');

module.exports = function (config) {
    config.set({
        basePath: 'src',
        frameworks: ['mocha', 'chai'],
        files: [
            "**/*.spec.ts"
        ],
        exclude: [],
        preprocessors: {
            '**/*.spec.ts': ['webpack']
        },
        webpack: {
            devtool: 'cheap-module-source-map',
            module: webpackConfig.module,
            resolve: webpackConfig.resolve,
            externals: {
                // 'cheerio': 'window',
                'react/addons': true,
                'react/lib/ExecutionEnvironment': true,
                'react/lib/ReactContext': true
            },
            context: __dirname,
            node: {
                __filename: true
            }
        },
        reporters: ['mocha'],
        mochaReporter: {
            showDiff: true
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false
    })
};