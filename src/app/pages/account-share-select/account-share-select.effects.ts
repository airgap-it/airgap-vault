import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Action, Store } from '@ngrx/store'
import { of } from 'rxjs'
import { switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { Secret } from 'src/app/models/secret'
import { InteractionOperationType, InteractionService, InteractionSetting } from 'src/app/services/interaction/interaction.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { ShareUrlService } from 'src/app/services/share-url/share-url.service'

import * as actions from './account-share-select.actions'
import * as fromAccountShareSelect from './account-share-select.reducers'

@Injectable()
export class AccountShareSelectEffects {
  public secrets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.viewInitialization),
      withLatestFrom(this.secretsService.getSecretsObservable()),
      switchMap(([_, secrets]) => of(actions.initialDataLoaded({ secrets })))
    )
  )

  public sync$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.syncButtonClicked),
        withLatestFrom(this.store.select(fromAccountShareSelect.selectCheckedSecrets)),
        tap(([_, checkedSecrets]) => this.generateAndShowQr(checkedSecrets))
      ),
    { dispatch: false }
  )

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<fromAccountShareSelect.State>,
    private readonly secretsService: SecretsService,
    private readonly shareUrlService: ShareUrlService,
    private readonly interactionService: InteractionService
  ) {}

  private async generateAndShowQr(secrets: Secret[]): Promise<Action[]> {
    const shareUrl: string = await this.shareUrlService.generateShareSecretsURL(secrets)
    const interactionSetting: InteractionSetting = this.getCommonInteractionSetting(secrets)
    this.interactionService.startInteraction(
      {
        operationType: InteractionOperationType.WALLET_SYNC,
        url: shareUrl
      },
      interactionSetting
    )

    return []
  }

  private getCommonInteractionSetting(secrets: Secret[]): InteractionSetting {
    for (let i = 1; i < secrets.length; i++) {
      if (secrets[i - 1]?.interactionSetting !== secrets[i]?.interactionSetting) {
        return InteractionSetting.UNDETERMINED
      }
    }

    return secrets[0]?.interactionSetting ?? InteractionSetting.UNDETERMINED
  }
}
