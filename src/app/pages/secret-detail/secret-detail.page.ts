import { Component, OnInit } from '@angular/core'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import * as bip39 from 'bip39'
import * as bip32 from 'bip32'
import { BIP32Interface } from 'bip32'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-detail',
  templateUrl: './secret-detail.page.html',
  styleUrls: ['./secret-detail.page.scss']
})
export class SecretDetailPage implements OnInit {
  constructor(private readonly secretsService: SecretsService, private readonly navigationService: NavigationService) {}

  async ngOnInit() {
    const secret = this.navigationService.getState().secret
    const entropy = await this.secretsService.retrieveEntropyForSecret(secret)
    const mnemonic: string = bip39.entropyToMnemonic(entropy)
    console.log('mnemonic', mnemonic)
    const seed = bip39.mnemonicToSeed(mnemonic)
    console.log(seed)
    console.log(seed.toString('hex'))
    const bip: BIP32Interface = bip32.fromSeed(seed)
    this.printBip32Info(bip)

    const derived = bip.derivePath(`m/44'/0'/0'/0`)
    console.log('derived', derived)
    this.printBip32Info(derived)
    const derived1 = bip.derivePath(`m/44'/0'/0'/0/0`)
    console.log('derived', derived1)
    this.printBip32Info(derived1)
  }

  public printBip32Info(bip: BIP32Interface) {
    console.log(bip.chainCode)
    console.log(bip.depth)
    console.log(bip.fingerprint)
    console.log(bip.fingerprint.toString('hex'))
    console.log(bip.identifier.toString('hex'))
    console.log(bip.index)
    console.log(bip.network)
    console.log(bip.lowR)
    console.log(bip.parentFingerprint)
    const pubKey = bip.neutered().toBase58()
    const privKey = bip.toBase58()
    console.log('publicKey', pubKey)
    console.log('privKey', privKey)

    console.log('pubKey', bip32.fromBase58(pubKey).fingerprint)
    console.log('privKey', bip32.fromBase58(privKey).fingerprint)

    console.log(bip.toBase58())
    console.log(bip.toWIF())
  }
}
