const fs = require('fs')
const path = require('path')

const browserify = require('browserify')

const rootdir = './'
const assetsdir = path.join(rootdir, 'src/assets')
const airgapModules = [
  // { path: path.join(rootdir, 'node_modules/@airgap/aeternity') },
  // {
  //   path: path.join(rootdir, 'node_modules/@airgap/astar'),
  //   jsenv: {
  //     android: 'webview'
  //   }
  // },
  // { path: path.join(rootdir, 'node_modules/@airgap/bitcoin') },
  // { path: path.join(rootdir, 'node_modules/@airgap/cosmos') },
  // {
  //   path: path.join(rootdir, 'node_modules/@airgap/ethereum'),
  //   jsenv: {
  //     android: 'webview'
  //   }
  // },
  // { path: path.join(rootdir, 'node_modules/@airgap/groestlcoin') },
  // {
  //   path: path.join(rootdir, 'node_modules/@airgap/icp'),
  //   jsenv: {
  //     android: 'webview'
  //   }
  // },
  // {
  //   path: path.join(rootdir, 'node_modules/@airgap/moonbeam'),
  //   jsenv: {
  //     android: 'webview'
  //   }
  // },
  // {
  //   path: path.join(rootdir, 'node_modules/@airgap/optimism'),
  //   jsenv: {
  //     android: 'webview'
  //   }
  // },
  // {
  //   path: path.join(rootdir, 'node_modules/@airgap/polkadot'),
  //   jsenv: {
  //     android: 'webview'
  //   }
  // },
  // {
  //   path: path.join(rootdir, 'node_modules/@airgap/tezos'),
  //   jsenv: {
  //     android: 'webview'
  //   }
  // }
]
const communityModules = [{ path: path.join(rootdir, 'node_modules/@airgap-community/iso-rootstock') }]

function createAirGapModule(module) {
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
    publicKey: '' /* TODO */,
    description: '',
    src: {
      namespace
    },
    include: [outputFile],
    jsenv: module.jsenv
  }

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
}

function copyCommunityModule(module) {
  const namespace = module.path.split('/').slice(-1)[0]
  const outputDir = path.join(assetsdir, `protocol_modules/${namespace}`)

  fs.mkdirSync(outputDir, { recursive: true })

  const manifestPath = path.join(module.path, 'manifest.json')
  const manifest = require(`./${manifestPath}`)
  manifest.include.forEach((file) => {
    fs.copyFileSync(path.join(module.path, file), path.join(outputDir, file))
  })

  fs.copyFileSync(manifestPath, path.join(outputDir, 'manifest.json'))
  fs.copyFileSync(path.join(module.path, 'module.sig'), path.join(outputDir, 'module.sig'))

  Object.entries(manifest.res?.symbol ?? {}).forEach(([key, value]) => {
    // TODO: improve robustness of the solution
    if (!value.startsWith('file://')) {
      return
    }

    const symbolPath = value.slice(7)
    const symbolExtension = symbolPath.split('.').slice(-1)
    fs.copyFileSync(
      path.join(module.path, symbolPath),
      path.join(rootdir, 'node_modules/@airgap/angular-core/src/assets/symbols', `${key}.${symbolExtension}`)
    )
  })
}

airgapModules.forEach((module) => createAirGapModule(module))
communityModules.forEach((module) => copyCommunityModule(module))
