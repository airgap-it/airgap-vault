import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'airgap-security-level-self-check',
  templateUrl: './security-level-self-check.page.html',
  styleUrls: ['./security-level-self-check.page.scss']
})
export class SecurityLevelSelfCheckPage implements OnInit {
  checkPhrases: string[] = [
    'Seedphrase was created in an offline setup',
    'Seedphrase is backed-up on a metal plate',
    'Seedphrase was created by using Coin Flip / Dice Rolls',
    'Seedphrase is backed-up via Social Recovery',
    'Seedphrase is protected with a BIP 39 Passphrase',
    'Seedphrase was never exposed to the internet',
    'AirGap Vault is installed on an offline device',
    'AirGap Vault runs on a device which was factory reset before the installation',
    'When updating the Vault the device was never connected to the internet',
    'AirGap Vault runs on an AirGap Knox managed device'
  ]

  constructor() {}

  ngOnInit() {}
}
