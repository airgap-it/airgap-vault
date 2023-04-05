import { IsolatedModuleInstalledMetadata, UIResourceStatus } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { ComponentStore, tapResponse } from '@ngrx/component-store'
import { from, Observable } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { VaultModulesService } from 'src/app/services/modules/modules.service'
import { IsolatedModulesListState } from './isolated-modules-list.types'

const initialState: IsolatedModulesListState = {
  modules: {
    status: UIResourceStatus.IDLE,
    value: []
  }
}

@Injectable()
export class IsolatedModulesListStore extends ComponentStore<IsolatedModulesListState> {
  constructor(private readonly modulesService: VaultModulesService) {
    super(initialState)
  }

  public readonly onPageLoaded$ = this.effect((props$: Observable<void>) => {
    return props$.pipe(
      switchMap(() => from(this.loadModules()).pipe(first())),
      tapResponse(
        (value: IsolatedModuleInstalledMetadata[]) => this.setModules(value),
        () => this.onError()
      )
    )
  })

  public readonly setModules = this.updater((state: IsolatedModulesListState, modules: IsolatedModuleInstalledMetadata[]) => {
    return {
      ...state,
      modules: {
        status: UIResourceStatus.SUCCESS,
        value: modules
      }
    }
  })

  public readonly onError = this.updater((state: IsolatedModulesListState) => {
    return {
      ...state,
      modules: {
        status: UIResourceStatus.ERROR,
        value: state.modules.value
      }
    }
  })

  private async loadModules(): Promise<IsolatedModuleInstalledMetadata[]> {
    return this.modulesService.getModulesMetadata()
  }
}