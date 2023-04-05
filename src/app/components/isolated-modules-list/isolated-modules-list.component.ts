import { BaseComponent, IsolatedModuleInstalledMetadata, IsolatedModuleMetadata, UIResourceStatus } from '@airgap/angular-core'
import { Component, EventEmitter, Inject, Output } from '@angular/core'
import { ViewWillEnter } from '@ionic/angular'
import { IsolatedModulesListFacade, IsolatedModulesListNgRxFacade, ISOLATED_MODULES_LIST_FACADE } from './isolated-modules-list.facade'
import { IsolatedModulesListStore } from './isolated-modules-list.store'

@Component({
  selector: 'airgap-isolated-modules-list',
  templateUrl: './isolated-modules-list.component.html',
  styleUrls: ['./isolated-modules-list.component.scss'],
  providers: [{ provide: ISOLATED_MODULES_LIST_FACADE, useClass: IsolatedModulesListNgRxFacade }, IsolatedModulesListStore]
})
export class IsolatedModulesListComponent extends BaseComponent<IsolatedModulesListFacade> implements ViewWillEnter {
  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus

  @Output()
  public onModuleSelected: EventEmitter<IsolatedModuleMetadata> = new EventEmitter()

  constructor(@Inject(ISOLATED_MODULES_LIST_FACADE) facade: IsolatedModulesListFacade) {
    super(facade)
  }

  public ionViewWillEnter(): void {
    this.facade.onViewInit()
  }

  public selectModule(module: IsolatedModuleInstalledMetadata) {
    this.onModuleSelected.emit(module)
  }
}