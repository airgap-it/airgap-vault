// a workaround for cordova-diagnostic-plugin: the plugin ignores Capacitor config setting and installs all its features

const fs = require('fs')
const path = require('path')

const rootdir = ''
const iosConfig = path.join(rootdir, 'ios/App/App/config.xml')
const androidConfig = path.join(rootdir, 'android/app/src/main/res/xml/config.xml')

const configFiles = [iosConfig, androidConfig]
const usedModules = ['CAMERA', 'MICROPHONE']
const diagnosticModuleRegex = getModuleFeatureRegex('.+')

function getModuleFeatureRegex(module) {
    return RegExp(`<feature name=\"Diagnostic_(?<moduleName>${module})\">([\\s\\S]*?)<\/feature>(\n\r?)*`, 'gm')
}

function removeUnusedModules(configFile) {
    fs.readFile(configFile, 'utf8', function (err, data) {
        if (err) {
            return console.log(err)
        }

        let result = data

        let unusedModules = []
        while (match = diagnosticModuleRegex.exec(result)) {
            const moduleName = match.groups.moduleName
            const isUsed = usedModules.map(function (item) { return item.toUpperCase() }).indexOf(moduleName.toUpperCase()) > -1

            if (!isUsed) {
                unusedModules.push(moduleName)
            }
        }

        if (unusedModules.length > 0) {
            result = result.replace(getModuleFeatureRegex(unusedModules.join('|')), '\r')

            fs.writeFile(configFile, result, 'utf8', function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }
    })
}

configFiles.forEach(configFile => removeUnusedModules(configFile));