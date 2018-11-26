import { AirGapWallet, UnsignedTransaction } from 'airgap-coin-lib'

class WalletMock {
  ethWallet: AirGapWallet = new AirGapWallet(
    'eth',
    '03ea568e601e6e949a3e5c60e0f4ee94383e4b083c5ab64b66e70372df008cbbe6',
    false,
    "m/44'/60'/0'/0/0"
  )
  ethTransaction: UnsignedTransaction = {
    callback: '',
    publicKey: '03ea568e601e6e949a3e5c60e0f4ee94383e4b083c5ab64b66e70372df008cbbe6',
    transaction: {
      nonce: '0x0',
      gasPrice: '0x4a817c800',
      gasLimit: '0x5208',
      to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
      value: '0xde0b6b3a7640000',
      chainId: 1,
      data: '0x'
    }
  }
}

export { WalletMock }
