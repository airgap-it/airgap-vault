import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TouchEntropyComponent } from './touch-entropy.component'

describe('TouchEntropyComponent', () => {
  let component: TouchEntropyComponent
  let fixture: ComponentFixture<TouchEntropyComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TouchEntropyComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TouchEntropyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
