import { BaseComponent, IsolatedModuleInstalledMetadata, IsolatedModuleMetadata, UIResourceStatus } from '@airgap/angular-core'
import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { takeUntil } from 'rxjs/operators'
import { IsolatedModulesListFacade, IsolatedModulesListNgRxFacade, ISOLATED_MODULES_LIST_FACADE } from './isolated-modules-list.facade'
import { IsolatedModulesListStore } from './isolated-modules-list.store'

@Component({
  selector: 'airgap-isolated-modules-list',
  templateUrl: './isolated-modules-list.component.html',
  styleUrls: ['./isolated-modules-list.component.scss'],
  providers: [{ provide: ISOLATED_MODULES_LIST_FACADE, useClass: IsolatedModulesListNgRxFacade }, IsolatedModulesListStore]
})
export class IsolatedModulesListComponent extends BaseComponent<IsolatedModulesListFacade> implements OnChanges {
  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus

  @Input()
  public filter: string | undefined

  @Output()
  public modulesLength: EventEmitter<number> = new EventEmitter()

  @Output()
  public onModuleSelected: EventEmitter<IsolatedModuleMetadata> = new EventEmitter()

  constructor(@Inject(ISOLATED_MODULES_LIST_FACADE) facade: IsolatedModulesListFacade) {
    super(facade)

    this.facade.allModulesLength$.pipe(takeUntil(this.ngDestroyed$)).subscribe((value) => {
      this.modulesLength.emit(value)
    })
  }

  public ngOnInit() {
    this.facade.initWithFilter(this.filter)

    return super.ngOnInit()
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.filter.previousValue !== changes.filter.currentValue) {
      this.facade.filterModules(changes.filter.currentValue)
    }
  }

  public selectModule(module: IsolatedModuleInstalledMetadata) {
    this.onModuleSelected.emit(module)
  }
}