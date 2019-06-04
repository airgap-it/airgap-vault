import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TabScanPage } from './tab-scan.page'

describe('TabScanPage', () => {
  let component: TabScanPage
  let fixture: ComponentFixture<TabScanPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabScanPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TabScanPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
