import { Component, OnInit } from '@angular/core'
import { BIP85 } from 'bip85'
import { Secret } from 'src/app/models/secret'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecureStorage, SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'

import * as bip39 from 'bip39'
import * as bip32 from 'bip32'

@Component({
  selector: 'airgap-bip85-show',
  templateUrl: './bip85-show.page.html',
  styleUrls: ['./bip85-show.page.scss']
})
export class Bip85ShowPage implements OnInit {
  constructor(private readonly navigationService: NavigationService, private readonly secureStorageService: SecureStorageService) {
    if (this.navigationService.getState()) {
      const secret = this.navigationService.getState().secret
      const length = this.navigationService.getState().length
      const index = this.navigationService.getState().index

      this.generateChildMnemonic(secret, length, index)
    }
  }

  ngOnInit() {}

  public async generateChildMnemonic(secret: Secret, length: 12 | 18 | 24, index: number) {
    const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

    try {
      const secretHex = await secureStorage.getItem(secret.id).then((result) => result.value)

      const mnemonic = bip39.entropyToMnemonic(secretHex)
      console.log(mnemonic)
      const seed = bip39.mnemonicToSeed(mnemonic)
      console.log(seed)

      const x = bip32.fromSeed(seed)
      console.log(x.toBase58())

      const masterSeed = new BIP85(bip32.fromSeed(seed))

      const childEntropy = masterSeed.deriveBIP39(0 as any, length, index)

      console.log(childEntropy)

      console.log(bip39.entropyToMnemonic(childEntropy))
    } catch (error) {
      throw error
    }
  }
}
