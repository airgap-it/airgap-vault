import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SecretItemComponent } from './secret-item.component'

describe('SecretItemComponent', () => {
  let component: SecretItemComponent
  let fixture: ComponentFixture<SecretItemComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecretItemComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
