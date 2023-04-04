import { BaseComponent, IsolatedModuleMetadata, UIResourceStatus } from '@airgap/angular-core'
import { Component, EventEmitter, Inject, Output } from '@angular/core'
import { IsolatedModulesListFacade, IsolatedModulesListNgRxFacade, ISOLATED_MODULES_LIST_FACADE } from './isolated-modules-list.facade'
import { IsolatedModulesListStore } from './isolated-modules-list.store'
import { IsolatedModuleDetails } from './isolated-modules-list.types'

@Component({
  selector: 'airgap-isolated-modules-list',
  templateUrl: './isolated-modules-list.component.html',
  styleUrls: ['./isolated-modules-list.component.scss'],
  providers: [{ provide: ISOLATED_MODULES_LIST_FACADE, useClass: IsolatedModulesListNgRxFacade }, IsolatedModulesListStore]
})
export class IsolatedModulesListComponent extends BaseComponent<IsolatedModulesListFacade> {
  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus

  @Output()
  public onModuleSelected: EventEmitter<IsolatedModuleMetadata> = new EventEmitter()

  constructor(@Inject(ISOLATED_MODULES_LIST_FACADE) facade: IsolatedModulesListFacade) {
    super(facade)
  }

  public selectModule(module: IsolatedModuleDetails) {
    this.onModuleSelected.emit(module.metadata)
  }
}