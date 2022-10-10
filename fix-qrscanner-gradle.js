// a workaround for cordova-diagnostic-plugin: the plugin ignores Capacitor config setting and installs all its features

const fs = require('fs')
const path = require('path')

const rootdir = ''
const qrscannerGradle = path.join(rootdir, 'node_modules/cordova-plugin-qrscanner-11/src/android/qrscanner.gradle')

const configFiles = [qrscannerGradle]

function replaceDeprecated(configFile) {
  fs.readFile(configFile, 'utf8', function(err, data) {
    if (err) {
      return console.log(err)
    }

    const result = data.replaceAll('compile', 'implementation')
    fs.writeFile(configFile, result, 'utf8', function(err) {
      if (err) {
        console.log(err)
      }
    })
  })
}

configFiles.forEach(configFile => replaceDeprecated(configFile))
