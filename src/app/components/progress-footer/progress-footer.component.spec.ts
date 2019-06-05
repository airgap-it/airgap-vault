import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ProgressFooterComponent } from './progress-footer.component'

describe('ProgressFooterComponent', () => {
  let component: ProgressFooterComponent
  let fixture: ComponentFixture<ProgressFooterComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressFooterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressFooterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
