const fs = require('fs')
const path = require('path')

const browserify = require('browserify')

const rootdir = './'
const assetsdir = path.join(rootdir, 'src/assets')
const modules = [
  { path: path.join(rootdir, 'node_modules/@airgap/aeternity') },
  { 
    path: path.join(rootdir, 'node_modules/@airgap/astar'),
    jsenv: {
      android: 'webview'
    }
  },
  { path: path.join(rootdir, 'node_modules/@airgap/bitcoin') },
  { path: path.join(rootdir, 'node_modules/@airgap/cosmos') },
  { 
    path: path.join(rootdir, 'node_modules/@airgap/ethereum'),
    jsenv: {
      android: 'webview'
    }
  },
  { path: path.join(rootdir, 'node_modules/@airgap/groestlcoin') },
  { 
    path: path.join(rootdir, 'node_modules/@airgap/icp'),
    jsenv: {
      android: 'webview'
    }
  },
  { 
    path: path.join(rootdir, 'node_modules/@airgap/moonbeam'),
    jsenv: {
      android: 'webview'
    }
  },
  { 
    path: path.join(rootdir, 'node_modules/@airgap/polkadot'),
    jsenv: {
      android: 'webview'
    }
  },
  { 
    path: path.join(rootdir, 'node_modules/@airgap/tezos'),
    jsenv: {
      android: 'webview'
    }
  }
]

function createAssetModule(module) {
  const packageJson = require(`./${path.join(module.path, 'package.json')}`)
  const namespace = module.path.split('/').slice(-1)[0]
  const outputDir = path.join(assetsdir, `protocol_modules/${namespace}`)
  const outputFile = 'index.browserify.js'

  fs.mkdirSync(outputDir, { recursive: true })

  browserify(`${module.path}/v1/module.js`, { standalone: namespace })
    .bundle()
    .pipe(fs.createWriteStream(path.join(outputDir, outputFile)))


  const manifest = {
    name: packageJson.name,
    version: packageJson.version,
    author: packageJson.author,
    publicKey: "" /* TODO */,
    description: "",
    src: {
      namespace
    },
    include: [
      outputFile
    ],
    jsenv: module.jsenv
  }

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
}

modules.forEach((path) => createAssetModule(path))