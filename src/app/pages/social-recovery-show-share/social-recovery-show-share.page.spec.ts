import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SocialRecoveryShowSharePage } from './social-recovery-show-share.page'

describe('SocialRecoveryShowSharePage', () => {
  let component: SocialRecoveryShowSharePage
  let fixture: ComponentFixture<SocialRecoveryShowSharePage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SocialRecoveryShowSharePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialRecoveryShowSharePage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
