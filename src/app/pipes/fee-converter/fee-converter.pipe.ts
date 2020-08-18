import { Pipe, PipeTransform } from '@angular/core'
import { getProtocolByIdentifier, ICoinProtocol } from 'airgap-coin-lib'
import { BigNumber } from 'bignumber.js'
import { ProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'

@Pipe({
  name: 'feeConverter'
})
export class FeeConverterPipe implements PipeTransform {
  public transform(value: string | number, args: { protocolIdentifier: ProtocolSymbols }): string {
    if (!args.protocolIdentifier || (!value && value !== 0) || isNaN(Number(value))) {
      // console.warn(`FeeConverterPipe: necessary properties missing!\n` + `Protocol: ${args.protocolIdentifier}\n` + `Value: ${value}`)
      return ''
    }
    let protocol: ICoinProtocol

    try {
      protocol = getProtocolByIdentifier(args.protocolIdentifier)
    } catch (e) {
      return ''
    }

    const amount = new BigNumber(value)
    const fee = amount.shiftedBy(-1 * protocol.feeDecimals)

    return fee.toFixed() + ' ' + protocol.feeSymbol.toUpperCase()
  }
}
