import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { PinPage } from './pin.page'

describe('PinPage', () => {
  let component: PinPage
  let fixture: ComponentFixture<PinPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PinPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(PinPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
