import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TabAccountsPage } from './tab-accounts.page'

describe('TabAccountsPage', () => {
  let component: TabAccountsPage
  let fixture: ComponentFixture<TabAccountsPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabAccountsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TabAccountsPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
