import { Component, OnInit } from '@angular/core'
import { TotpService } from 'src/app/services/totp/totp.service'

@Component({
  selector: 'airgap-totp-setup',
  templateUrl: './totp-setup.page.html',
  styleUrls: ['./totp-setup.page.scss']
})
export class TotpSetupPage implements OnInit {
  public data: string | undefined
  public code: number | undefined

  constructor(private readonly totpService: TotpService) {
    this.data = this.totpService.getUrl()
  }

  ngOnInit() {}

  changed() {
    console.log('changed!', this.code)
    const isValid = this.totpService.validate(this.code.toString())
    console.log('valid', isValid)
  }
}
