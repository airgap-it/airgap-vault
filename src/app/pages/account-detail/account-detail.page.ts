import { AirGapWallet } from '@airgap/coinlib-core'
import { Component, OnInit } from '@angular/core'
import { BIP32Interface } from 'bip32'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import * as bip32 from 'bip32'

@Component({
  selector: 'airgap-account-detail',
  templateUrl: './account-detail.page.html',
  styleUrls: ['./account-detail.page.scss']
})
export class AccountDetailPage implements OnInit {
  wallet: AirGapWallet
  fingerprint: string = ''
  selectedTab: string = 'external'
  addresses: string[] = []

  constructor(private readonly navigationService: NavigationService) {
    this.wallet = this.navigationService.getState().wallet
  }

  ngOnInit() {
    console.log(this.wallet)

    const bip: BIP32Interface = bip32.fromBase58(this.wallet.publicKey)
    this.printBip32Info(bip)
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value
    const bip: BIP32Interface = bip32.fromBase58(this.wallet.publicKey)
    this.printBip32Info(bip)
  }

  public async printBip32Info(bip: BIP32Interface) {
    this.addresses = []
    console.log(bip.chainCode)
    console.log(bip.depth)
    console.log(bip.fingerprint)
    this.fingerprint = bip.fingerprint.toString('hex')
    const child = bip.derive(this.selectedTab === 'external' ? 0 : 1)
    for (let index = 0; index < 10; index++) {
      const x = child.derive(index).toBase58()

      this.addresses.push(await this.wallet.protocol.getAddressFromPublicKey(x))
    }

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
    // console.log(bip.toWIF())
  }
}
