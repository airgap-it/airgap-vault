import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { getWordAroundPosition, SecureKeyboardComponent } from './secure-keyboard.component'

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

  fit('should create', () => {
    expect(component).toBeTruthy()

    console.log(getWordAroundPosition('aaa bbb ccc', 0) === 'aaa')
    console.log(getWordAroundPosition('aaa bbb ccc', 1) === 'aaa')
    console.log(getWordAroundPosition('aaa bbb ccc', 2) === 'aaa')
    console.log(getWordAroundPosition('aaa bbb ccc', 3) === 'aaa')
    console.log(getWordAroundPosition('aaa bbb ccc', 4) === 'bbb')
    console.log(getWordAroundPosition('aaa bbb ccc', 5) === 'bbb')
    console.log(getWordAroundPosition('aaa bbb ccc', 6) === 'bbb')
    console.log(getWordAroundPosition('aaa bbb ccc', 7) === 'bbb')
    console.log(getWordAroundPosition('aaa bbb ccc', 8) === 'ccc')
    console.log(getWordAroundPosition('aaa bbb ccc', 9) === 'ccc')
    console.log(getWordAroundPosition('aaa bbb ccc', 10) === 'ccc')
    console.log(getWordAroundPosition('aaa bbb ccc', 11) === 'ccc')
  })
})
