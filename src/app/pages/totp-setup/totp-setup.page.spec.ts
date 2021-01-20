import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { TotpSetupPage } from './totp-setup.page'

describe('TotpSetupPage', () => {
  let component: TotpSetupPage
  let fixture: ComponentFixture<TotpSetupPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TotpSetupPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(TotpSetupPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
