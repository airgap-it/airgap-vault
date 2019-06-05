import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SecretGeneratePage } from './secret-generate.page'

describe('SecretGeneratePage', () => {
  let component: SecretGeneratePage
  let fixture: ComponentFixture<SecretGeneratePage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecretGeneratePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretGeneratePage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
