import { TezosBTC } from '@airgap/coinlib-core'
import { UnsignedTezosTransaction } from '@airgap/coinlib-core'
const protocol = new TezosBTC()
const unsignedTx: UnsignedTezosTransaction = {
  transaction: {
    binaryTransaction:
      'e6e8df93add4aba2570b3eb04655fb2259417303a5e1a9fbebe96dd3c491b6286c0016e64994c2ddbd293695b63e4cade029d3c8b5e380d461f6b10780b518e0d40300018046bbe4ccf4869a2110daf44f41f3bd0af00d6000ffff087472616e736665720000005807070100000024747a314d6a37527a506d4d417144554e46426e3574355662586d5757346353554164745407070100000024747a31556d4d3654556f39504a3256697863567a4777414a706f62684378317959706d560001'
  },
  publicKey: '9430c2ac8fe1403c6cbbee3a98b19f3f3bbdd89d0659b3eb6e4106a5cbe41351',
  callback: 'airgap-wallet://?d='
}
console.log('THIS IS THE PROTOCOL', protocol)

protocol
  .getTransactionDetails(unsignedTx)
  .then((airGapTxs) => {
    console.log('airGapTxs', airGapTxs)
  })
  .catch((err) => console.error(err))
