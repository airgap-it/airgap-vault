import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AdvancedSettingsPage } from './advanced-settings.page'

describe('AdvancedSettingsPage', () => {
  let component: AdvancedSettingsPage
  let fixture: ComponentFixture<AdvancedSettingsPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancedSettingsPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(AdvancedSettingsPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
