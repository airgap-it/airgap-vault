import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { ThresholdAccountComponent } from './threshold-account.component'

describe('ThresholdAccountComponent', () => {
  let component: ThresholdAccountComponent
  let fixture: ComponentFixture<ThresholdAccountComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThresholdAccountComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(ThresholdAccountComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
