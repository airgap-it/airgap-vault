self.importScripts('sha3.min.js')

let previousEntropyArray = []

self.onmessage = function (event) {
  const entropyArray = new Uint8Array(event.data.entropyBuffer)
  self.calcEntropy(previousEntropyArray, entropyArray)
  previousEntropyArray = entropyArray
}

self.calcEntropy = function (byteArrayA, byteArrayB) {
  let sum = 0
  if (byteArrayB.length >0 && byteArrayA.length > 0) {

    for (let i = 0; i < Math.min(byteArrayA.length, byteArrayB.length); i++) {
      sum += Math.abs(byteArrayA[i] - byteArrayB[i])
    }

    const entropyMeasure = sum / byteArrayA.length
    const hash = sha3_256.create()
    hash.update(byteArrayB)
    self.postMessage({entropyMeasure: entropyMeasure, entropyHex: hash.hex()})
  }
}
