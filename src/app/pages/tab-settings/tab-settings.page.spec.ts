import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TabSettingsPage } from './tab-settings.page'

describe('TabSettingsPage', () => {
  let component: TabSettingsPage
  let fixture: ComponentFixture<TabSettingsPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabSettingsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TabSettingsPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
