import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LocalAuthenticationOnboardingPage } from './local-authentication-onboarding.page'

describe('LocalAuthenticationOnboardingPage', () => {
  let component: LocalAuthenticationOnboardingPage
  let fixture: ComponentFixture<LocalAuthenticationOnboardingPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LocalAuthenticationOnboardingPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalAuthenticationOnboardingPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
