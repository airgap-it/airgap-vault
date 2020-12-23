import { AirGapMarketWallet, IAirGapTransaction, getProtocolByIdentifier } from '@airgap/coinlib-core'
import BigNumber from 'bignumber.js'
import { MainProtocolSymbols } from '@airgap/coinlib-core'

class WalletMock {
  public ethWallet: AirGapMarketWallet = Object.assign(
    new AirGapMarketWallet(
      getProtocolByIdentifier(MainProtocolSymbols.ETH),
      '03ea568e601e6e949a3e5c60e0f4ee94383e4b083c5ab64b66e70372df008cbbe6',
      false,
      "m/44'/60'/0'/0/0",
      undefined
    ),
    {
      currentMarketPrice: new BigNumber('100')
    }
  )
  public ethTransaction: IAirGapTransaction = {
    from: ['0x4681Df42ca7d5f0E986FFeA979A55c333f5c0a05'],
    to: ['0x579D75370dd53C59e09E6F51F4D935220D7EEcF8'],
    amount: '10000000000000',
    fee: '0',
    protocolIdentifier: MainProtocolSymbols.ETH,
    publicKey: '03ea568e601e6e949a3e5c60e0f4ee94383e4b083c5ab64b66e70372df008cbbe6',
    payload: {
      none: '3',
      gasLimit: '21000',
      gasPrice: '10000000000',
      to: '0x579D75370dd53C59e09E6F51F4D935220D7EEcF8',
      from: '0x4681Df42ca7d5f0E986FFeA979A55c333f5c0a05',
      value: '10000000000000',
      chainId: '1'
    }
  } as any

  public btcWallet: AirGapMarketWallet = new AirGapMarketWallet(
    getProtocolByIdentifier(MainProtocolSymbols.BTC),
    'xpub6CcLgL3yuTNxguFdSikacKj93R77GMToq1488BKLdZMAQ2BfrVQrx31phHwqhx4kRUTNCeyiWiqvppaykiXM9w8RWJFbhj1etsCgBckA2bF',
    false,
    "m/44'/0'/0'",
    undefined
  )
  public btcTransaction: IAirGapTransaction = {
    from: ['1JzeZaZwb1gLxQEwexUn4XmZ3tmSfuesBo'],
    to: ['1JzeZaZwb1gLxQEwexUn4XmZ3tmSfuesBo'],
    amount: '10000000000000',
    fee: '0',
    protocolIdentifier: MainProtocolSymbols.BTC,
    payload: {
      ins: [
        {
          txId: 'f0cad3ef387743f27fb02b7636b7a134f5b04390cbf54dfd26c3cda3da3b49f5',
          value: 111404,
          vout: 1,
          address: '1JzeZaZwb1gLxQEwexUn4XmZ3tmSfuesBo',
          derivationPath: '0/0'
        }
      ],
      outs: [
        { recipient: '1JzeZaZwb1gLxQEwexUn4XmZ3tmSfuesBo', isChange: false, value: 10000 },
        { recipient: '19TEBVnMWkL78WbVnVs64Q9igrvqjzfw28', isChange: true, value: 101396 }
      ]
    },
    publicKey: '026892a703a3a8816e476db3e47d6d2ae8912f4ef1c47026b80651740623110ae5'
  } as any

  public static injectSecret() {
    // removed seed
  }
}

export { WalletMock }
