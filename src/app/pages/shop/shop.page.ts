import { ClipboardService } from '@airgap/angular-core'
import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'airgap-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss']
})
export class ShopPage implements OnInit {
  private link: string = 'https://shop.airgap.it/?ref=Link-Vault'

  constructor(private readonly clipboardService: ClipboardService, private readonly translateService: TranslateService) {}

  ngOnInit() {}

  async open() {
    await this.clipboardService.copyAndShowToast(this.link, this.translateService.instant('link-page.link-clipboard_label'))
  }
}
