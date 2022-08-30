import { Component, OnInit } from '@angular/core'
import { split as splitSeedXor } from 'seed-xor'
import { split as splitHamming } from 'seed-xor-hamming'
import { MnemonicSecret } from 'src/app/models/secret'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecureStorage, SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import * as bip39 from 'bip39'
import { LifehashService } from 'src/app/services/lifehash/lifehash.service'

@Component({
  selector: 'airgap-seed-xor-generate',
  templateUrl: './seed-xor-generate.page.html',
  styleUrls: ['./seed-xor-generate.page.scss']
})
export class SeedXorGeneratePage implements OnInit {
  public type: 'seed-xor' | 'seed-xor-hamming' = 'seed-xor'

  public numberOfShares: number = 3

  public useRandom: boolean = false

  public secret: MnemonicSecret

  public shares: { share: string; fingerprint: string; lifehashData: string }[] = []

  constructor(
    private readonly navigationService: NavigationService,
    private readonly lifehashService: LifehashService,
    private readonly secureStorageService: SecureStorageService
  ) {
    if (this.navigationService.getState()) {
      this.secret = this.navigationService.getState().secret
      this.type = this.navigationService.getState().type
    }
  }

  async ngOnInit() {}

  public setNumberOfShares(i: number): void {
    this.numberOfShares = i
  }

  public async generate() {
    const secureStorage: SecureStorage = await this.secureStorageService.get(this.secret.id, this.secret.isParanoia)

    try {
      const secretHex = await secureStorage.getItem(this.secret.id).then((result) => result.value)

      const mnemonic = bip39.entropyToMnemonic(secretHex)

      console.log('mnemonic', mnemonic)

      if (this.type === 'seed-xor') {
        this.createShares(await splitSeedXor(mnemonic, this.numberOfShares as any, this.useRandom))
      } else if (this.type === 'seed-xor-hamming') {
        this.createShares(await splitHamming(mnemonic, this.useRandom))
      }
    } catch (error) {
      throw error
    }
  }

  public async createShares(shares: string[]) {
    this.shares = []

    shares.forEach(async (share) => {
      const newShare = {
        share: share,
        fingerprint: 'asdf',
        lifehashData: await this.lifehashService.generateLifehash('asdf')
      }

      this.shares.push(newShare)
    })
  }
}
