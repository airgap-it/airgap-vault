import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideMockStore } from '@ngrx/store/testing'

import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { MigrationPage } from './migration.page'
import * as fromMigration from './migration.reducers'

describe('MigrationPage', () => {
  let component: MigrationPage
  let fixture: ComponentFixture<MigrationPage>

  let unitHelper: UnitHelper

  const initialState: fromMigration.State = {
    migration: fromMigration.initialState
  }

  beforeEach(
    waitForAsync(() => {
      unitHelper = new UnitHelper()

      TestBed.configureTestingModule(
        unitHelper.testBed({
          declarations: [MigrationPage],
          providers: [provideMockStore({ initialState })]
        })
      )
        .compileComponents()
        .catch(console.error)

      fixture = TestBed.createComponent(MigrationPage)
      component = fixture.componentInstance
      fixture.detectChanges()
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
