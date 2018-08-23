import { Pipe, PipeTransform } from '@angular/core'
import { BigNumber } from 'bignumber.js'
import { getProtocolByIdentifier } from 'airgap-coin-lib'

@Pipe({
  name: 'feeConverter'
})

export class FeeConverterPipe implements PipeTransform {
  transform(value: string, args: { protocolIdentifier: string }): any {
    return new BigNumber(value).shiftedBy(-1 * (getProtocolByIdentifier(args.protocolIdentifier).feeDecimals)).toString() + ' ' + getProtocolByIdentifier(args.protocolIdentifier).feeSymbol.toUpperCase()
  }
}
