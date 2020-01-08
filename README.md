# AirGap Vault

<p align="left">
    <img src="./banner.png" />
</p>

> Your old smartphone is your new ‘hardware wallet’

[AirGap](https://airgap.it) is a crypto wallet system, that let's you secure cypto assets with one secret on an offline device. The AirGap Vault application is installed on a is installed on a dedicated or old smartphone that has no connection to any network, thus it is air gapped. The [AirGap Wallet](https://github.com/airgap-it/airgap-wallet) is installed installed on an everyday smartphone.

## Description

AirGap Vault is responsible for secure key generation, for this entropy like audio, video, touch and accelerator are added to the hardware random number generated. The generated secret is saved in the secure enclave of the respective mobile operating system only accessible by biometric authentication. Accounts for multiple protcols can be created and transactions prepared by the AirGap Wallet application without any network connection needed. The mobile application, AirGap Vault is a hybrid application (using the same codebase for Android and iOS which helps with coordinated development). Created using Ionic framework and AirGap's coin-lib to interact with different protocols and a secure storage implementation.

<p align="left">
    <img src="./devices.png" />
</p>

## Download

- [Google Play](https://play.google.com/store/apps/details?id=it.airgap.vault)
- [App Store](https://itunes.apple.com/us/app/airgap-vault-secure-secrets/id1417126841?l=de&ls=1&mt=8)

## Features

- Secure secret generation with added entropy like audio, video, touch and device accelerator
- Secure storage in the secure enclave of the mobile operating system, accessible only by biometric authenticaiton
- Secure Communication with AirGap Wallet over URL schemes, QR codes or app switching
- Create accounts for all supported currencies like Aeternity, Ethereum, Bitcoin etc.
- Sign transactions created by AirGap Wallet

## Security

The security concept behind air-gapped systems is to work with two physically separated devices, one of which has no connection to the outside world, any network. In the context of AirGap the component which has no internet connection is AirGap Vault. The two components, AirGap Vault and AirGap Wallet, communicate through URL schemes, these URLs can be simply provided with QR codes.


### Key Generation

The entropy seeder uses the native secure random functionality provided by the system and concatenates this with the sha3 hash of the additional entropy. The rationale behind this is:

- the sha3 hashing algorithm is cryptographically secure such that the following holds: `entropy(sha3(secureRandom())) >= entropy(secureRandom())`
- adding bytes to the sha3 function will never lover entropy but only add to it such that the following holds: `entropy(sha3(secureRandom() + additionaEntropy)) >= entropy(sha3(secureRandom()))`
- by reusing the hash of an earlier "round" as a salt we can incorporate the entire collected entropy of the previous round.
- native secure random cannot be fully trusted because there is no API to check the entropy pool it's using

The algorithm being used for the entropy seeding:

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

## Build

First follow the steps below to install the dependencies:

```bash
$ npm install -g ionic
$ npm install -g cordova
$ npm install
```

Run locally in browser:

```bash
$ ionic serve
```

Run on device:

```bash
$ ionic cordova platform run android
$ ionic cordova platform run ios
```

## Testing

To run the unit tests:

```bash
$ npm test
```

## Security

If you discover a security vulnerability within this application, please send an e-mail to hi@airgap.it. All security vulnerabilities will be promptly addressed.

## Verifiability

The builds of AirGap Vault are reproducible, which means anybody can verify the contents of the signed apk by comparing them to their locally built version. To build the Vault, please refer to the chapter "Release Build" in this readme. The reproducible builds have been verified by a third party [WalletScrutiny](https://walletscrutiny.com/posts/it.airgap.vault/).

## Release build

To build a release version of the Vault, you have to clone this project and run the following commands in the root directory. (Docker has to be installed)

```
sed -i -e "s/version=\"0.0.0\"/version=\"0.0.1\"/g" config.xml
docker build -f build/android/Dockerfile -t airgap-vault --build-arg BUILD_NR="1" --build-arg VERSION="0.0.1" .
docker run --name "airgap-vault-build" airgap-vault echo "container ran."
docker cp airgap-vault-build:/app/android-release-unsigned.apk airgap-vault-release-unsigned.apk
docker cp airgap-vault-build:/app/android-debug.apk airgap-vault-debug.apk
```

## Contributing

- If you find any bugs, submit an [issue](../../issues) or open [pull-request](../../pulls), helping us catch and fix them.
- Engage with other users and developers on the [AirGap Telegram](https://t.me/AirGap).