// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

/*global jasmine */
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

const screenshotReporter = new HtmlScreenshotReporter({
  dest: 'e2e-reports/screenshots',
  filename: 'e2e-report.html'
})

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    '../e2e/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      prefs: { 'profile.managed_default_content_settings.media_stream': 1 },
      args: [ '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream' ]
      // args: [ 'no-sandbox', '--headless', '--disable-gpu', '--window-size=375,667' ]
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:8100/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e'
    });
    return new Promise(function(resolve){
      screenshotReporter.beforeLaunch(resolve);
    });
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(new SpecReporter());
    jasmine.getEnv().addReporter(screenshotReporter);
  },
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      screenshotReporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }
};
