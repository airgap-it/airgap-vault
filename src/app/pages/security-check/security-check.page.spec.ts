import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { SecurityCheckPage } from './security-check.page'

describe('SecurityCheckPage', () => {
  let component: SecurityCheckPage
  let fixture: ComponentFixture<SecurityCheckPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecurityCheckPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(SecurityCheckPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
