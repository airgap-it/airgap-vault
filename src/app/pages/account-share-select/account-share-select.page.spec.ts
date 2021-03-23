import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { provideMockStore } from '@ngrx/store/testing'

import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { AccountShareSelectPage } from './account-share-select.page'
import * as fromAccountShareSelect from './account-share-select.reducers'

describe('AccountShareSelectPage', () => {
  let component: AccountShareSelectPage
  let fixture: ComponentFixture<AccountShareSelectPage>

  let unitHelper: UnitHelper

  const initialState: fromAccountShareSelect.State = {
    accountShareSelect: fromAccountShareSelect.initialState
  }

  beforeEach(
    waitForAsync(() => {
      unitHelper = new UnitHelper()

      TestBed.configureTestingModule(
        unitHelper.testBed({
          declarations: [AccountShareSelectPage],
          providers: [provideMockStore({ initialState })]
        })
      )
        .compileComponents()
        .catch(console.error)

      fixture = TestBed.createComponent(AccountShareSelectPage)
      component = fixture.componentInstance
      fixture.detectChanges()
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
