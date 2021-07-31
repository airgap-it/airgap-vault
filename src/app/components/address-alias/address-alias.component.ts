import { AddressService } from '@airgap/angular-core'
import { BitcoinProtocol } from '@airgap/coinlib-core'
import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'airgap-address-alias',
  templateUrl: './address-alias.component.html',
  styleUrls: ['./address-alias.component.scss']
})
export class AddressAliasComponent implements OnInit {
  @Input()
  address: string

  alias: string

  constructor(private readonly addressService: AddressService) {}

  async ngOnInit() {
    this.alias = await this.addressService.getAlias(this.address, new BitcoinProtocol())
  }
}
