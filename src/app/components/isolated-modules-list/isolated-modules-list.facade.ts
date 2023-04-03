import { BaseFacade, UIResource, UIResourceStatus } from '@airgap/angular-core'
import { BaseNgRxFacade } from '@airgap/angular-ngrx'
import { Injectable, InjectionToken } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { IsolatedModulesListStore } from './isolated-modules-list.store'
import { IsolatedModuleDetails } from './isolated-modules-list.types'

export const ISOLATED_MODULES_LIST_FACADE = new InjectionToken<IsolatedModulesListFacade>('IsolatedModulesListFacade')
export type IsolatedModulesListFacade<T extends BaseFacade = BaseFacade> = IIsolatedModulesListFacade & T

export interface IIsolatedModulesListFacade {
  readonly modules$: Observable<UIResource<IsolatedModuleDetails[]>>
}

@Injectable()
export class IsolatedModulesListNgRxFacade extends BaseNgRxFacade<IsolatedModulesListStore> implements IIsolatedModulesListFacade {
  public readonly modules$: Observable<UIResource<IsolatedModuleDetails[]>>

  constructor(store: IsolatedModulesListStore) {
    super(store)

    this.modules$ = new BehaviorSubject({ status: UIResourceStatus.SUCCESS, value: [] })
  }
}