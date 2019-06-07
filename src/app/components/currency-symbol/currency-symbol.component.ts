import { AfterViewInit, Component, Input } from '@angular/core'

@Component({
  selector: 'airgap-currency-symbol',
  templateUrl: './currency-symbol.component.html',
  styleUrls: ['./currency-symbol.component.scss']
})
export class CurrencySymbolComponent implements AfterViewInit {
  @Input()
  private readonly symbol: string | undefined

  public symbolURL: string = 'assets/symbols/generic-coin.svg'

  constructor() {
    /* */
  }

  public ngAfterViewInit() {
    if (this.symbol) {
      const imageUrl = 'assets/symbols/' + this.symbol.toLowerCase() + '.svg'
      const img = new Image()
      img.onload = () => {
        this.symbolURL = imageUrl
      }
      img.src = imageUrl
    }
  }
}
