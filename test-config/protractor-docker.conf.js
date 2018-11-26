// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

/*global jasmine */
const baseConfig = require('./protractor.conf')
const SpecReporter = require('jasmine-spec-reporter').SpecReporter

baseConfig.config.directConnect = false
baseConfig.config.seleniumAddress = 'http://localhost:4444/wd/hub'

exports.config = baseConfig.config
