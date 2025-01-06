import { AirGapWallet, AirGapWalletStatus, ProtocolSymbols } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { LifehashService } from 'src/app/services/lifehash/lifehash.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

import { MnemonicSecret } from '../../models/secret'
import { AdvancedModeType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'airgap-secret-item',
  templateUrl: './secret-item.component.html',
  styleUrls: ['./secret-item.component.scss']
})
export class SecretItemComponent implements OnInit {
  @Input()
  public secret: MnemonicSecret

  public activeWallets: { symbol: string; protocolIdentifier: ProtocolSymbols }[]
  public hasMoreWallets: number = 0

  public lifehashData: string = ''

  public isAdvancedMode$: Observable<boolean> = this.storageService
    .subscribe(VaultStorageKey.ADVANCED_MODE_TYPE)
    .pipe(map((res) => res === AdvancedModeType.ADVANCED))

  constructor(
    private readonly secretsService: SecretsService,
    public navigationService: NavigationService,
    private readonly lifehashService: LifehashService,
    private readonly storageService: VaultStorageService
  ) {}

  public async ngOnInit() {
    this.secretsService.getActiveSecretObservable().subscribe((secret: MnemonicSecret) => {
      if (secret && secret.wallets) {
        this.getWalletsFromSecret()
      }
    })

    this.getWalletsFromSecret()

    const bytes = this.secret.fingerprint
      ? new Uint8Array(this.secret.fingerprint.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
      : new Uint8Array()

    this.lifehashData = await this.lifehashService.generateLifehash(bytes)
  }

  public async getWalletsFromSecret() {
    const activeWallets: AirGapWallet[] = this.secret.wallets.filter((wallet: AirGapWallet) => wallet.status === AirGapWalletStatus.ACTIVE)
    const comparableActiveWallets: [string, AirGapWallet][] = await Promise.all(
      activeWallets.map(async (wallet: AirGapWallet) => {
        return [await wallet.protocol.getName(), wallet] as [string, AirGapWallet]
      })
    )
    const sortedActiveWallets: AirGapWallet[] = comparableActiveWallets
      .sort((a: [string, AirGapWallet], b: [string, AirGapWallet]) => a[0].localeCompare(b[0])) // TODO: Use same order as common lib
      .map(([_, wallet]: [string, AirGapWallet]) => wallet)

    this.activeWallets = await Promise.all(
      sortedActiveWallets.map(async (wallet: AirGapWallet) => {
        const [symbol, protocolIdentifier] = await Promise.all([wallet.protocol.getSymbol(), wallet.protocol.getIdentifier()])

        return { symbol, protocolIdentifier }
      })
    )

    if (this.activeWallets.length > 10) {
      this.hasMoreWallets = this.activeWallets.length - 10
      this.activeWallets = this.activeWallets.slice(0, 10)
    } else {
      this.hasMoreWallets = 0
    }
  }

  public goToAccountsList(): void {
    this.navigationService.routeWithState('/accounts-list', { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
