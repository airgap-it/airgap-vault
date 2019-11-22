import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { SecureBasePage } from './secure-base.page'

describe('SecureBasePage', () => {
  let component: SecureBasePage
  let fixture: ComponentFixture<SecureBasePage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecureBasePage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(SecureBasePage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
