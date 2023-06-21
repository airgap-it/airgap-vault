import { MainProtocolSymbols } from '@airgap/coinlib-core'

export class StorageMock {
  private readonly data: any = {
    wallets: [
      {
        protocolIdentifier: MainProtocolSymbols.BTC,
        publicKey: 'xpub6EWbRuGLw9bTVVU9HE2MqT5QQ7zm9G64QgeZ5SY7qPWbciM7FyyG9BP2id1ewqZipXVWx2racXMMRvF1jB8S4syc1RzYRjnBhuq425KKYx5',
        isExtendedPublicKey: true,
        derivationPath: "m/44'/0'/0'",
        addresses: [],
        marketSample: [],
        minuteMarketSample: [],
        dailyMarketSample: [],
        hourlyMarketSample: []
      }
    ]
  }

  public create(): Promise<StorageMock> {
    return Promise.resolve(this)
  }

  public defineDriver(): Promise<void> {
    return Promise.resolve()
  }

  public get(key: string): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve(this.data[key])
    })
  }

  public set(key: string, value: any): Promise<void> {
    return new Promise((resolve, _reject) => {
      this.data[key] = value
      resolve()
    })
  }

  public remove(key: string): Promise<void> {
    return new Promise((resolve, _reject) => {
      delete this.data[key]
      resolve()
    })
  }

  public ready(): Promise<void> {
    return Promise.resolve()
  }
}
