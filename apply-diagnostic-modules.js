// a workaround for cordova-diagnostic-plugin: the plugin ignores Capacitor config setting and installs all its features

const fs = require('fs')
const path = require('path')

const rootdir = ''
const pluginConfig = path.join(rootdir, 'node_modules/cordova.plugins.diagnostic/plugin.xml')

const configFiles = [pluginConfig]
const usedModules = ['CAMERA', 'MICROPHONE']
const diagnosticModuleStartRegex = getModuleFeatureStartRegex('.+')

function getModuleFeatureStartRegex(module) {
    return RegExp(`(<!--BEGIN_MODULE (?<moduleName>${module.toUpperCase()})-->).*`, 'g')
}

function getModuleFeatureEndRegex(module) {
    return RegExp(`.*(<!--END_MODULE (?<moduleName>${module.toUpperCase()})-->)`, 'g')
}

function removeUnusedModules(configFile) {
    fs.readFile(configFile, 'utf8', function (err, data) {
        if (err) {
            return console.log(err)
        }

        let result = data
        let unusedModules = []
        while (match = diagnosticModuleStartRegex.exec(result)) {
            const moduleName = match.groups.moduleName
            const isUsed = usedModules.map(function (item) { return item.toUpperCase() }).indexOf(moduleName.toUpperCase()) > -1

            if (!isUsed) {
                unusedModules.push(moduleName)
            }
        }

        if (unusedModules.length > 0) {
            result = result.replace(getModuleFeatureStartRegex(unusedModules.join('|')), '$1 <!--')
            result = result.replace(getModuleFeatureEndRegex(unusedModules.join('|')), '--> $1')

            fs.writeFile(configFile, result, 'utf8', function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }
    })
}

configFiles.forEach(configFile => removeUnusedModules(configFile));