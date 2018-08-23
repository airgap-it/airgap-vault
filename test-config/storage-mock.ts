export class StorageMock {

  private data = {
    'airgap-secret-list': [{
      'id': '3e14638e-319b-4280-8c34-6e6f0a10df6e',
      'label': 'asdsad',
      'isParanoia': false,
      'wallets': [
        {
          'protocolIdentifier': 'eth',
          'publicKey': '03ea568e601e6e949a3e5c60e0f4ee94383e4b083c5ab64b66e70372df008cbbe6',
          'isExtendedPublicKey': false,
          'derivationPath': 'm/44\'/60\'/0\'/0/0',
          'addresses': []
        }
      ]
    }]
  }

  get(key: string) {
    return new Promise((resolve, reject) => {
      resolve(this.data[key])
    })
  }

  set(key: string, value: any) {
    return new Promise((resolve, reject) => {
      this.data[key] = value
      resolve()
    })
  }

}
