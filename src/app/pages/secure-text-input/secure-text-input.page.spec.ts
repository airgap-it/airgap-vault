import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { SecureTextInputPage } from './secure-text-input.page'

describe('SecureTextInputPage', () => {
  let component: SecureTextInputPage
  let fixture: ComponentFixture<SecureTextInputPage>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SecureTextInputPage],
        imports: [IonicModule.forRoot()]
      }).compileComponents()

      fixture = TestBed.createComponent(SecureTextInputPage)
      component = fixture.componentInstance
      fixture.detectChanges()
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
