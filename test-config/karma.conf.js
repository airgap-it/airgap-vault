var webpackConfig = require('./webpack.test.js')

// inject chrome headless using puppeteer
process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function(config) {
  var _config = {
    basePath: '../',

    frameworks: ['jasmine'],

    files: [
      {
        pattern: './test-config/karma-test-shim.js',
        watched: true
      },
      {
        pattern: './src/assets/**/*',
        watched: false,
        included: false,
        served: true,
        nocache: false
      },
      { pattern: 'node_modules/rxjs/**/*', included: false, watched: false }
    ],

    proxies: {
      '/assets': '/base/src/assets'
    },

    preprocessors: {
      './test-config/karma-test-shim.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    },

    webpackServer: {
      noInfo: true
    },

    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },

    coverageIstanbulReporter: {
      reports: ['text', 'lcovonly'],
      fixWebpackSourcePaths: true
    },

    reporters: config.coverage ? ['spec', 'coverage-istanbul'] : ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false
  }

  config.set(_config)
}
