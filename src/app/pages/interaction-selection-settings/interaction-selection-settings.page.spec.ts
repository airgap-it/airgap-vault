import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { InteractionSelectionSettingsPage } from './interaction-selection-settings.page'

describe('InteractionSelectionSettingsPage', () => {
  let component: InteractionSelectionSettingsPage
  let fixture: ComponentFixture<InteractionSelectionSettingsPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InteractionSelectionSettingsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractionSelectionSettingsPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
