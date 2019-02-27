import { Component, Input } from '@angular/core'

@Component({
  selector: 'currency-symbol',
  templateUrl: 'currency-symbol.html'
})
export class CurrencySymbolComponent {
  @Input()
  private symbol: string

  public symbolURL: string = 'assets/symbols/generic-coin.svg'

  constructor() {
    /* */
  }

  ngAfterViewInit() {
    const imageUrl = 'assets/symbols/' + this.symbol.toLowerCase() + '.svg'
    const img = new Image()
    img.onload = () => {
      this.symbolURL = imageUrl
    }
    img.src = imageUrl
  }
}
