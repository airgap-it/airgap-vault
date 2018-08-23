# Secure Mobile Offline Keystore and Signer

An open source mobile app used to store secrets and sign transactions securely.

## Introduction

Together with the Aeternity team we identified the urging need for an easy and secure method to generate crypto currency keys, store them and use them to sign transactions. Having worked with large financial institutions helping them in securing their most sensitive apps, the AirGap team believes to give the crypto community a tool that meets the highest possible standards of mobile security.

## Attack Vectors

These are the relevant attack vectors we identified and how we mitigate them, feel free to contact us and discuss possible other scenarios:

## App 2 App Communication

The security concept behind air gapped systems is to work with 2 physically separated devices, one of which has no connection to the outside world (internet). In our context the component which has no internet connection is this signer app. The two component communicate through URL schemes, these URLs can be simply provided with QR codes.

## Key Generation

### Entropy Seeder

The entropy seeder uses the native secure random functionality provided by the system and concatenates this with the sha3 hash of the additional entropy. The rationale behind this is:

- the sha3 hashing algorithm is cryptographically secure such that the following holds: `entropy(sha3(secureRandom())) >= entropy(secureRandom())`
- adding bytes to the sha3 function will never lover entropy but only add to it such that the following holds: `entropy(sha3(secureRandom() + additionaEntropy)) >= entropy(sha3(secureRandom()))`
- by reusing the hash of an earlier "round" as a salt we can incorporate the entire collected entropy of the previous round.
- native secure random cannot be fully trusted because there is no API to check the entropy pool it's using

For more technical people here the algorithm being used for the entropy seeding:

```
const ENTROPY_BYTE_SIZE = 256
let entropyHashHexString = null


function toHexString(array){
  return array.map(function(i) {
    return ('0' + i.toString(16)).slice(-2);
}).join('');
}

function seedEntropy (additionalEntropyArray) {
   const secureRandomArray = new Uint8Array(ENTROPY_BYTE_SIZE)
   window.crypto.getRandomValues(secureRandomArray)
   console.log(entropyHashHexString+toHexString(secureRandomArray)+toHexString(additionalEntropyArray))
   entropyHashHexString = sha3_256(entropyHashHexString+toHexString(secureRandomArray)+toHexString(additionalEntropyArray))
   return entropyHashHexString
}
```

## Similar Initiatives

- https://github.com/paritytech/parity-signer
- https://bitkey.io/
- https://myetherwallet.com/

