import { BaseComponent, IsolatedModuleMetadata, UIResourceStatus } from '@airgap/angular-core'
import { Component, Inject, Input, OnChanges, SimpleChanges } from '@angular/core'
import { IsolatedModulesDetailsFacade, IsolatedModulesDetailsNgRxFacade, ISOLATED_MODULES_DETAILS_FACADE } from './isolated-modules-details.facade'
import { IsolatedModulesDetailsStore } from './isolated-modules-details.store'

@Component({
  selector: 'airgap-isolated-modules-details',
  templateUrl: './isolated-modules-details.component.html',
  styleUrls: ['./isolated-modules-details.component.scss'],
  providers: [{ provide: ISOLATED_MODULES_DETAILS_FACADE, useClass: IsolatedModulesDetailsNgRxFacade }, IsolatedModulesDetailsStore]
})
export class IsolatedModulesDetailsComponent extends BaseComponent<IsolatedModulesDetailsFacade> implements OnChanges {
  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus

  @Input()
  public metadata: IsolatedModuleMetadata | undefined

  constructor(@Inject(ISOLATED_MODULES_DETAILS_FACADE) facade: IsolatedModulesDetailsFacade) {
    super(facade)
  }

  public ngOnInit() {
    this.facade.initWithData(this.metadata)

    return super.ngOnInit()
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.metadata.previousValue !== changes.metadata.currentValue) {
      this.facade.onDataChanged(changes.metadata.currentValue)
    }
  }
}