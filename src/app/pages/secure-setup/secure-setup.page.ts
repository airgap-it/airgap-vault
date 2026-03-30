import { Component } from '@angular/core'
import { Platform } from '@ionic/angular'

@Component({
  selector: 'airgap-secure-setup',
  templateUrl: './secure-setup.page.html',
  styleUrls: ['./secure-setup.page.scss']
})
export class SecureSetupPage {
  public isIos: boolean
  public isAndroid: boolean

  constructor(private readonly platform: Platform) {
    this.isIos = this.platform.is('ios')
    this.isAndroid = this.platform.is('android')
  }
}
