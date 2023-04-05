import { IsolatedModuleInstalledMetadata, UIResource } from '@airgap/angular-core'

export interface IsolatedModulesListState {
  modules: UIResource<IsolatedModuleInstalledMetadata[]>
}
