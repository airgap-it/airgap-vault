// a workaround for cordova-diagnostic-plugin: the plugin ignores Capacitor config setting and installs all its features

const fs = require('fs')
const path = require('path')

const rootdir = ''
const pluginConfig = path.join(rootdir, 'node_modules/cordova.plugins.diagnostic/plugin.xml')

const configFiles = [pluginConfig]

const LEGACY_SUPPORT_V4_ID = 'androidx.legacy:legacy-support-v4'
const APP_COMPAT_ID = 'androidx.appcompat:appcompat'

function getXMLDependencyRegex(versions, id) {
  const targetVersion = versions[id].replace(/\./g, '\\.')
  return RegExp(`(?<indent>.*)<framework src="(?<dependencyId>${id}):(?!${targetVersion}).*" \/>`, 'g')
}

function patchDependencyVersion(configFile, versions) {
  fs.readFile(configFile, 'utf8', function(err, data) {
    if (err) {
      return console.log(err)
    }

    const regexes = [
      getXMLDependencyRegex(versions, LEGACY_SUPPORT_V4_ID), 
      getXMLDependencyRegex(versions, APP_COMPAT_ID)
    ]
    let result = data
    regexes.forEach(regex => {
      while ((match = regex.exec(result))) {
        const indent = match.groups.indent || ''
        const dependencyId = match.groups.dependencyId
        const version = versions[dependencyId]


        if (version !== undefined) {
          result = result.replace(regex, `${indent}<framework src="${dependencyId}:${version}" />`)
        }
      }
    })

    fs.writeFile(configFile, result, 'utf8', function(err) {
      if (err) {
        console.log(err)
      }
    })
  })
}

function getVersions(callback) {
  const variablesGradle = path.join(rootdir, 'android/variables.gradle')
  fs.readFile(variablesGradle, 'utf8', function(err, data) {
    if (err) {
      callback(err, undefined)
    }

    const appCompatVersionMatch = RegExp('.*androidxAppCompatVersion = \'(?<version>.+)\'', 'g').exec
    (data)
    const appCompatVersion = appCompatVersionMatch ? appCompatVersionMatch.groups.version : undefined

    const versions = {
      [LEGACY_SUPPORT_V4_ID]: '1.0.0',
      [APP_COMPAT_ID]: appCompatVersion || '1.3.1'
    }

    callback(undefined, versions)
  })
}

getVersions((err, versions) => {
  if (err) {
    return console.log(err)
  }

  configFiles.forEach(configFile => patchDependencyVersion(configFile, versions))
})
