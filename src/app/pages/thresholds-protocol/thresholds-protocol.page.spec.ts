import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { ThresholdsProtocolPage } from './thresholds-protocol.page'

describe('ThresholdsProtocolPage', () => {
  let component: ThresholdsProtocolPage
  let fixture: ComponentFixture<ThresholdsProtocolPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThresholdsProtocolPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(ThresholdsProtocolPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
