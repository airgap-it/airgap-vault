import { Pipe, PipeTransform } from '@angular/core'
import { BigNumber } from 'bignumber.js'
import { getProtocolByIdentifier } from 'airgap-coin-lib'

@Pipe({
  name: 'feeConverter'
})
export class FeeConverterPipe implements PipeTransform {
  transform(value: string | number, args: { protocolIdentifier: string }): string {
    if (!args.protocolIdentifier || (!value && value !== 0) || isNaN(Number(value))) {
      // console.warn(`FeeConverterPipe: necessary properties missing!\n` + `Protocol: ${args.protocolIdentifier}\n` + `Value: ${value}`)
      return ''
    }

    const protocol = getProtocolByIdentifier(args.protocolIdentifier)
    if (!protocol) {
      return ''
    }

    const amount = new BigNumber(value)
    const fee = amount.shiftedBy(-1 * protocol.feeDecimals)

    return fee.toFixed() + ' ' + protocol.feeSymbol.toUpperCase()
  }
}
