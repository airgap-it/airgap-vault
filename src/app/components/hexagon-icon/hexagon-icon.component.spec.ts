import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HexagonIconComponent } from './hexagon-icon.component'

describe('HexagonIconComponent', () => {
  let component: HexagonIconComponent
  let fixture: ComponentFixture<HexagonIconComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HexagonIconComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HexagonIconComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
