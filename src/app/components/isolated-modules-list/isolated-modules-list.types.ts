import { IsolatedModuleMetadata, UIResource } from '@airgap/angular-core'

export interface IsolatedModulesListState {
  modules: UIResource<IsolatedModuleDetails[]>
}

export interface IsolatedModuleDetails {
  metadata: IsolatedModuleMetadata
  installedAt: number
}