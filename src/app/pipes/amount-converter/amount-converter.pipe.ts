import { Pipe, PipeTransform } from '@angular/core'
import { getProtocolByIdentifier } from 'airgap-coin-lib'
import { BigNumber } from 'bignumber.js'

@Pipe({
  name: 'amountConverter'
})
export class AmountConverterPipe implements PipeTransform {
  public transform(value: string | number, args: { protocolIdentifier: string; maxDigits: number }): string {
    if (!args.protocolIdentifier || (!value && value !== 0) || isNaN(Number(value)) || (args.maxDigits && isNaN(Number(args.maxDigits)))) {
      /* console.warn(
        `AmountConverterPipe: necessary properties missing!\n` +
          `Protocol: ${args.protocolIdentifier}\n` +
          `Value: ${value}\n` +
          `maxDigits: ${args.maxDigits}`
      ) */
      return ''
    }

    let protocol

    try {
      protocol = getProtocolByIdentifier(args.protocolIdentifier)
    } catch (e) {
      return ''
    }

    const BN = BigNumber.clone({
      FORMAT: {
        decimalSeparator: `.`,
        groupSeparator: `'`,
        groupSize: 3
      }
    })
    const amount = new BN(value).shiftedBy(-1 * protocol.decimals)

    return `${this.formatBigNumber(amount, args.maxDigits)} ${protocol.symbol}`
  }

  public formatBigNumber(value: BigNumber, maxDigits?: number): string {
    if (!maxDigits) {
      return value.toFormat()
    }

    if (value.toFixed().length <= maxDigits) {
      return value.toFormat()
    }

    const integerValueLength = value.integerValue().toString().length
    if (integerValueLength >= maxDigits) {
      // We can omit floating point
      return this.makeFullNumberSmaller(value, maxDigits)
    }

    // Need regex to remove all unneccesary trailing zeros
    return value.toFormat(maxDigits - integerValueLength).replace(/\.?0+$/, '')
  }

  public makeFullNumberSmaller(value: BigNumber, maxDigits: number): string {
    if (value.toFixed().length <= maxDigits) {
      return value.toFormat()
    }

    let result = value.integerValue()

    if (result.toString().length <= maxDigits) {
      return result.toFormat()
    }

    if (result.toString().length <= 3) {
      return result.toFormat()
    }

    // number is too long, take 3 digits away and try again
    result = result.dividedToIntegerBy(1000)

    if (result.toFixed().length <= maxDigits) {
      return result.toFormat() + 'K'
    }

    if (result.toFixed().length <= 3) {
      return result.toFormat() + 'K'
    }

    // number is too long, take 3 digits away and try again
    result = result.dividedToIntegerBy(1000)

    return result.toFormat() + 'M'
  }
}
