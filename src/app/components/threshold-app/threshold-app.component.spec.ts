import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { ThresholdAppComponent } from './threshold-app.component'

describe('ThresholdAppComponent', () => {
  let component: ThresholdAppComponent
  let fixture: ComponentFixture<ThresholdAppComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThresholdAppComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(ThresholdAppComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
