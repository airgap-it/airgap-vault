import { PipeTransform, Pipe } from '@angular/core'
import { BigNumber } from 'bignumber.js'
import { getProtocolByIdentifier } from 'airgap-coin-lib'

@Pipe({
  name: 'amountConverter'
})

export class AmountConverterPipe implements PipeTransform {
  transform(value: string, args: { protocolIdentifier: string }): any {
    return new BigNumber(value).shiftedBy(-1 * (getProtocolByIdentifier(args.protocolIdentifier).decimals)).toString() + ' ' + getProtocolByIdentifier(args.protocolIdentifier).symbol.toUpperCase()
  }
}
