import { AirGapMarketWallet } from '@airgap/coinlib-core'
import { Component, OnInit } from '@angular/core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import * as bip32 from 'bip32'
import * as bs58check from 'bs58check'

// https://github.com/satoshilabs/slips/blob/master/slip-0132.md
class ExtendedPublicKey {
  private readonly rawKey: Buffer
  constructor(extendedPublicKey: string) {
    this.rawKey = bs58check.decode(extendedPublicKey).slice(4)
  }

  toXpub() {
    return this.addPrefix('0488b21e')
  }

  toYPub() {
    return this.addPrefix('049d7cb2')
  }

  toZPub() {
    return this.addPrefix('04b24746')
  }

  private addPrefix(prefix: string) {
    const data = Buffer.concat([Buffer.from(prefix, 'hex'), this.rawKey])
    return bs58check.encode(data)
  }
}

interface AddressInfo {
  address: string
  derivationPath: string
  isExpanded: boolean
}

@Component({
  selector: 'airgap-address-explorer',
  templateUrl: './address-explorer.page.html',
  styleUrls: ['./address-explorer.page.scss']
})
export class AddressExplorerPage implements OnInit {
  public wallet: AirGapMarketWallet
  // public fingerprint: string = ''
  public selectedTab: string = 'external'
  public xpub: string = ''
  public addresses: AddressInfo[] = []

  constructor(private readonly navigationService: NavigationService) {
    this.wallet = this.navigationService.getState().wallet
  }

  ngOnInit() {
    if (this.wallet) {
      // this.fingerprint = this.wallet.masterFingerprint
      this.xpub = bip32.fromBase58(new ExtendedPublicKey(this.wallet.publicKey).toXpub()).toBase58()
      this.clearAddresses()
    }
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value
    this.clearAddresses()
  }

  public async clearAddresses() {
    this.addresses = []
    this.addAddresses()
  }

  public async loadData(event: any) {
    await this.addAddresses()

    event.target.complete()
  }

  public toggle(address: AddressInfo) {
    address.isExpanded = !address.isExpanded
  }

  public async addAddresses() {
    const nofAddresses = this.addresses.length

    for (let i = 0; i < 20; i++) {
      const visibilityIndex = this.selectedTab === 'external' ? 0 : 1
      const index = nofAddresses + i
      const address = (await this.wallet.protocol.getAddressFromExtendedPublicKey(this.xpub, visibilityIndex, index)).getValue()

      const derivationPath = `${this.wallet.derivationPath}/${visibilityIndex}/${index}`

      this.addresses.push({ address, derivationPath, isExpanded: false })
    }
  }
}
