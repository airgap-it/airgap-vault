import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { ThresholdMessageComponent } from './threshold-message.component'

describe('ThresholdMessageComponent', () => {
  let component: ThresholdMessageComponent
  let fixture: ComponentFixture<ThresholdMessageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThresholdMessageComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(ThresholdMessageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
