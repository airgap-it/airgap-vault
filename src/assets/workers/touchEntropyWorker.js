self.onmessage = function(event) {
  const percentage = event.data.percentage
  const previousEntropyBuffer = event.data.previousEntropyBuffer
  const entropyBuffer = event.data.entropyBuffer

  self.calcEntropy(percentage, new Uint8Array(previousEntropyBuffer), new Uint8Array(entropyBuffer));
}

self.calcEntropy = function (percentage, byteArrayA, byteArrayB) {
  let sum = 0
  
  for (let i = 0; i < Math.min(byteArrayA.length, byteArrayB.length); i++) {
    sum += Math.abs(byteArrayA[i] - byteArrayB[i])
  }

  let newPercentage = sum / byteArrayA.length

  self.postMessage({ percentage: percentage + newPercentage / 10 });
}