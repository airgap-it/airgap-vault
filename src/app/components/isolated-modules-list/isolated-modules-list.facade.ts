import { BaseFacade, IsolatedModuleInstalledMetadata, UIResource } from '@airgap/angular-core'
import { BaseNgRxFacade } from '@airgap/angular-ngrx'
import { Injectable, InjectionToken } from '@angular/core'
import { Observable } from 'rxjs'
import { IsolatedModulesListStore } from './isolated-modules-list.store'
import { IsolatedModulesListState } from './isolated-modules-list.types'

export const ISOLATED_MODULES_LIST_FACADE = new InjectionToken<IsolatedModulesListFacade>('IsolatedModulesListFacade')
export type IsolatedModulesListFacade<T extends BaseFacade = BaseFacade> = IIsolatedModulesListFacade & T

export interface IIsolatedModulesListFacade {
  readonly modules$: Observable<UIResource<IsolatedModuleInstalledMetadata[]>>
}

@Injectable()
export class IsolatedModulesListNgRxFacade extends BaseNgRxFacade<IsolatedModulesListStore> implements IIsolatedModulesListFacade {
  public readonly modules$: Observable<UIResource<IsolatedModuleInstalledMetadata[]>>

  constructor(store: IsolatedModulesListStore) {
    super(store)

    this.modules$ = this.store.select((state: IsolatedModulesListState) => state.modules)
  }

  public onViewInit() {
    this.store.onPageLoaded$()

    return super.onViewInit()
  }
}