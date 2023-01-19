import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Action } from '@ngrx/store'
import { concat, from, of } from 'rxjs'
import { first, switchMap, tap } from 'rxjs/operators'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { isProtocolModuleMetadata, ProtocolModuleMetadata, ProtocolModuleService } from 'src/app/services/protocol-module/protocol-module.service'

import * as actions from './module-preview.actions'

@Injectable()
export class ModulePreviewEffects {
  public navigationData$ = createEffect(() => 
    this.actions$.pipe(
      ofType(actions.viewInitialization),
      switchMap(() => concat(of(actions.navigationDataLoading()), from(this.loadNavigationData()).pipe(first())))
    )
  )

  public installModule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.installModule),
      switchMap(({ metadata }) => concat(of(actions.moduleInstalling()), from(this.installModule(metadata)).pipe(first())))
    )
  )

  public moduleInstalled$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.moduleInstalled),
        tap(() => this.navigateToHome())
      ),
    { dispatch: false }
  )

  constructor(
    private readonly actions$: Actions,
    private readonly navigationService: NavigationService,
    private readonly protocolModuleService: ProtocolModuleService
  ) {}

  private async loadNavigationData(): Promise<Action> {
    const state = this.navigationService.getState()

    return isProtocolModuleMetadata(state.metadata)
      ? actions.navigationDataLoaded({ metadata: state.metadata })
      : actions.invalidData()
  }

  private async installModule(metadata: ProtocolModuleMetadata): Promise<Action> {
    try {
      await this.protocolModuleService.installModule(metadata)
      return actions.moduleInstalled()
    } catch (error) {
      console.error(error)
      return actions.moduleFailedToInstall()
    }
  }

  private async navigateToHome(): Promise<void> {
    this.navigationService.route('/').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}