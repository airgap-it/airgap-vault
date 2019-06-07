import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SocialRecoveryValidateSharePage } from './social-recovery-validate-share.page'

describe('SocialRecoveryValidateSharePage', () => {
  let component: SocialRecoveryValidateSharePage
  let fixture: ComponentFixture<SocialRecoveryValidateSharePage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SocialRecoveryValidateSharePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialRecoveryValidateSharePage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
