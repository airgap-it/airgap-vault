import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { ThresholdsPage } from './thresholds.page'

describe('ThresholdsPage', () => {
  let component: ThresholdsPage
  let fixture: ComponentFixture<ThresholdsPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThresholdsPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(ThresholdsPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
