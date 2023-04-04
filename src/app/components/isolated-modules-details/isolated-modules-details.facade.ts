import { BaseFacade, IsolatedModuleManifest, IsolatedModuleMetadata, UIResource } from '@airgap/angular-core'
import { BaseNgRxFacade } from '@airgap/angular-ngrx'
import { Injectable, InjectionToken } from '@angular/core'
import { Observable } from 'rxjs'
import { IsolatedModulesDetailsStore } from './isolated-modules-details.store'

export const ISOLATED_MODULES_DETAILS_FACADE = new InjectionToken<IsolatedModulesDetailsFacade>('IsolatedModulesDetailsFacade')
export type IsolatedModulesDetailsFacade<T extends BaseFacade = BaseFacade> = IIsolatedModulesListDetails & T

export interface IIsolatedModulesListDetails {
  readonly manifest$: Observable<UIResource<IsolatedModuleManifest>>

  initWithData(metadata: IsolatedModuleMetadata | undefined): void
  onDataChanged(metadata: IsolatedModuleMetadata | undefined): void
}

@Injectable()
export class IsolatedModulesDetailsNgRxFacade extends BaseNgRxFacade<IsolatedModulesDetailsStore> implements IIsolatedModulesListDetails {
  public readonly manifest$: Observable<UIResource<IsolatedModuleManifest>>

  constructor(store: IsolatedModulesDetailsStore) {
    super(store)

    this.manifest$ = this.store.select((state) => state.manifest)
  }

  public initWithData(metadata: IsolatedModuleMetadata): void {
    this.store.setData(metadata)
  }

  public onDataChanged(metadata: IsolatedModuleMetadata): void {
    this.store.setData(metadata)
  }
}