import { Component, Inject, NgZone, ViewChild } from '@angular/core'

import { ScanBasePage } from '../scan-base/scan-base'
import { QrScannerService, PermissionsService } from '@airgap/angular-core'
import { Platform } from '@ionic/angular'
import { SecurityUtilsPlugin } from 'src/app/capacitor-plugins/definitions'
import { SECURITY_UTILS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'
import { IACService } from 'src/app/services/iac/iac.service'
import { ZXingScannerComponent } from '@zxing/ngx-scanner'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { AddType } from 'src/app/services/contacts/contacts.service'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'

@Component({
  selector: 'airgap-contact-scan',
  templateUrl: './contact-book-scan.component.html',
  styleUrls: ['./contact-book-scan.component.scss']
})
export class ContactBookScanPage extends ScanBasePage {
  @ViewChild('scanner')
  public zxingScanner?: ZXingScannerComponent

  constructor(
    platform: Platform,
    scanner: QrScannerService,
    permissionsProvider: PermissionsService,
    @Inject(SECURITY_UTILS_PLUGIN) securityUtils: SecurityUtilsPlugin,
    private readonly iacService: IACService,
    private readonly ngZone: NgZone,
    private readonly navigationService: NavigationService
  ) {
    super(platform, scanner, permissionsProvider, securityUtils)
  }

  public async ionViewWillEnter(): Promise<void> {
    await super.ionViewWillEnter()
    this.resetScannerPage()
    this.iacService.resetHandlers()
  }

  private resetScannerPage(): void {
    this.iacService.resetHandlers()
  }

  public async checkScan(data: string): Promise<boolean | void> {
    if (data.length > 0) {
      const name  = await this.navigationService.getState().name ?? ''
      this.ngZone.run(async () => {
        this.resetScannerPage()
        this.stopScan()
        await this.navigationService
          .routeWithState('/contact-book-contacts-detail', { isNew: true, address: data, addType: AddType.QR, name })
          .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
    }
  }

  public ionViewWillLeave(): void {
    super.ionViewWillLeave()
    this.resetScannerPage()
  }
}
