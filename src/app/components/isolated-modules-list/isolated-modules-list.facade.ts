import { BaseFacade, IsolatedModuleInstalledMetadata, UIResource } from '@airgap/angular-core'
import { BaseNgRxFacade } from '@airgap/angular-ngrx'
import { Injectable, InjectionToken } from '@angular/core'
import { Observable } from 'rxjs'
import { IsolatedModulesListStore } from './isolated-modules-list.store'
import { IsolatedModulesListState } from './isolated-modules-list.types'

export const ISOLATED_MODULES_LIST_FACADE = new InjectionToken<IsolatedModulesListFacade>('IsolatedModulesListFacade')
export type IsolatedModulesListFacade<T extends BaseFacade = BaseFacade> = IIsolatedModulesListFacade & T

export interface IIsolatedModulesListFacade {
  readonly allModulesLength$: Observable<number>
  readonly filteredModules$: Observable<UIResource<IsolatedModuleInstalledMetadata[]>>

  initWithFilter(query: string | undefined)
  filterModules(query: string | undefined): void
}

@Injectable()
export class IsolatedModulesListNgRxFacade extends BaseNgRxFacade<IsolatedModulesListStore> implements IIsolatedModulesListFacade {
  public readonly allModulesLength$: Observable<number>
  public readonly filteredModules$: Observable<UIResource<IsolatedModuleInstalledMetadata[]>>

  constructor(store: IsolatedModulesListStore) {
    super(store)

    this.allModulesLength$ = this.store.select((state: IsolatedModulesListState) => state.allModules.value?.length ?? 0)
    this.filteredModules$ = this.store.select((state: IsolatedModulesListState) => state.filteredModules)
  }

  public initWithFilter(query: string | undefined) {
    this.store.onPageLoaded$(query)
  }

  public filterModules(query: string | undefined): void {
    this.store.filterModules(query)
  }
}