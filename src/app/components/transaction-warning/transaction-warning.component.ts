import { IAirGapTransaction } from '@airgap/coinlib-core'
import { AirGapTransactionWarning, AirGapTransactionWarningType } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { Component, Input } from '@angular/core'

@Component({
  selector: 'airgap-transaction-warning',
  templateUrl: './transaction-warning.component.html',
  styleUrls: ['./transaction-warning.component.scss']
})
export class TransactionWarningComponent {
  @Input()
  public set transaction(value: IAirGapTransaction | undefined) {
    this._transaction = value
    if (value) {
      this.warnings = value.warnings?.map((warning) => {
        return {
          ...warning,
          color:
            warning.type === AirGapTransactionWarningType.SUCCESS
              ? 'success'
              : warning.type === AirGapTransactionWarningType.NOTE
              ? 'light'
              : warning.type === AirGapTransactionWarningType.WARNING
              ? 'warning'
              : warning.type === AirGapTransactionWarningType.ERROR
              ? 'danger'
              : 'primary',
          icon: warning.icon
            ? warning.icon
            : warning.type === AirGapTransactionWarningType.SUCCESS
            ? 'checkmark-circle-outline'
            : warning.type === AirGapTransactionWarningType.NOTE
            ? 'information-circle-outline'
            : warning.type === AirGapTransactionWarningType.WARNING
            ? 'warning'
            : warning.type === AirGapTransactionWarningType.ERROR
            ? 'warning'
            : 'warning'
        }
      })
    }
  }

  public get transaction(): IAirGapTransaction | undefined {
    return this._transaction
  }

  public _transaction: IAirGapTransaction | undefined

  public warnings: (AirGapTransactionWarning & { color: string })[] | undefined

  constructor() {}
}
