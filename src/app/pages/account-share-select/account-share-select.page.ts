import { UIResource, UIResourceStatus } from '@airgap/angular-core'
import { Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { Secret } from 'src/app/models/secret'

import * as actions from './account-share-select.actions'
import * as fromAccountShareSelect from './account-share-select.reducers'

@Component({
  selector: 'airgap-account-share-select',
  templateUrl: './account-share-select.page.html',
  styleUrls: ['./account-share-select.page.scss']
})
export class AccountShareSelectPage {
  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus

  public readonly secrets$: Observable<UIResource<Secret[]>>
  public readonly isChecked$: Observable<Record<string, boolean>>

  constructor(private readonly store: Store<fromAccountShareSelect.State>) {
    this.secrets$ = this.store.select(fromAccountShareSelect.selectSecrets)
    this.isChecked$ = this.store.select(fromAccountShareSelect.selectIsSecretChecked)

    this.store.dispatch(actions.viewInitialization())
  }

  public toggleSecret(secret: Secret): void {
    this.store.dispatch(actions.secretToggled({ secretId: secret.id }))
  }

  public sync(): void {
    this.store.dispatch(actions.syncButtonClicked())
  }
}
