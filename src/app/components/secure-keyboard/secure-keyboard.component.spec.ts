import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { SecureKeyboardComponent } from './secure-keyboard.component'

describe('SecureKeyboardComponent', () => {
  let component: SecureKeyboardComponent
  let fixture: ComponentFixture<SecureKeyboardComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SecureKeyboardComponent],
        imports: [IonicModule.forRoot()]
      }).compileComponents()

      fixture = TestBed.createComponent(SecureKeyboardComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
