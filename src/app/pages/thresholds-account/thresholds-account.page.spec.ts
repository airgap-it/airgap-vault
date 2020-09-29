import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { ThresholdsAccountPage } from './thresholds-account.page'

describe('ThresholdsAccountPage', () => {
  let component: ThresholdsAccountPage
  let fixture: ComponentFixture<ThresholdsAccountPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThresholdsAccountPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(ThresholdsAccountPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
