import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { ThresholdProtocolComponent } from './threshold-protocol.component'

describe('ThresholdProtocolComponent', () => {
  let component: ThresholdProtocolComponent
  let fixture: ComponentFixture<ThresholdProtocolComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThresholdProtocolComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(ThresholdProtocolComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
