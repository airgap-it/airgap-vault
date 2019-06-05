import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SecretValidatePage } from './secret-validate.page'

describe('SecretValidatePage', () => {
  let component: SecretValidatePage
  let fixture: ComponentFixture<SecretValidatePage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecretValidatePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretValidatePage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
