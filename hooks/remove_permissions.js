const permissionsToRemove = ['INTERNET'];

const fs = require('fs')
const path = require('path')
const rootdir = ''
const manifestFile = path.join(rootdir, 'platforms/android/app/src/main/AndroidManifest.xml');

fs.readFile(manifestFile, 'utf8', function (err, data) {
  if (err) {
    return console.log(err)
  }

  let result = data
  for (let i = 0; i < permissionsToRemove.length; i++) {
    result = result.replace('<uses-permission android:name="android.permission.' + permissionsToRemove[i] + '" />', '')
    result = result.replace('<uses-feature android:name="android.hardware.camera" android:required="false" />', '')
    result = result.replace('<uses-permission android:name="android.permission.CAMERA" android:required="false" />', '')
    fs.writeFile(manifestFile, result, "utf8", function (err) {
      if (err)
        return console.log(err);
    })
  }
})
