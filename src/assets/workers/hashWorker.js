self.importScripts('sha3.min.js')

let hashHex = ''

self.onmessage = function (event) {
  let hash = sha3_256.create()
  hash.update(hashHex)

  if (event.data.call === 'init') {
    console.log('init hash...', event.data.secureRandom.length)
    hash.update(event.data.secureRandom)
  }

  if (event.data.call === 'update') {
    hash.update(event.data.entropyHex)
  }

  if (event.data.call === 'digest') {
    console.log('digesting hash...')
    self.postMessage({hash: hash.hex()})
  }

  hashHex = hash.hex()
}
