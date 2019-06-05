import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SecretShowPage } from './secret-show.page'

describe('SecretShowPage', () => {
  let component: SecretShowPage
  let fixture: ComponentFixture<SecretShowPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecretShowPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretShowPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
