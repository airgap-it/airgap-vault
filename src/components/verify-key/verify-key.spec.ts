import 'jasmine'
import { VerifyKeyComponent } from './verify-key'
import { ComponentFixture, TestBed, async } from '@angular/core/testing'
import { IonicModule } from 'ionic-angular'
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { createTranslateLoader } from '../../app/app.module'

describe('Component: VerifyKey', () => {
  let component: VerifyKeyComponent
  let fixture: ComponentFixture<VerifyKeyComponent>

  const correctMnemonic =
    'usage puzzle bottom amused genuine bike brown ripple lend aware symbol genuine neutral tortoise pluck rose brown cliff sing smile appear black occur zero'

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VerifyKeyComponent],
      imports: [
        IonicModule.forRoot(VerifyKeyComponent),
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        })
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(VerifyKeyComponent)
        component = fixture.componentInstance
      })
  }))

  it('should validate a regular mnemonic, and emit correct event', async(() => {
    component.secret = correctMnemonic
    fixture.detectChanges()
    let words = component.secret.split(' ')

    // validate onComplete Event is True
    component.onContinue.subscribe(event => {
      expect(event).toBeTruthy()
    })

    words.forEach((word, i) => {
      expect(component.isFull()).toBeFalsy()
      component.useWord({ word: word })
    })

    expect(component.isFull()).toBeTruthy()
    expect(component.isCorrect()).toBeTruthy()
  }))

  it('should detect a wrong word in a mnemonic', async(() => {
    component.secret = correctMnemonic
    fixture.detectChanges()
    const words = component.secret.split(' ')

    // validate onComplete Event is False
    component.onContinue.subscribe(event => {
      expect(event).toBeFalsy()
    })

    words.forEach((word, i) => {
      expect(component.isFull()).toBeFalsy()
      if (i === 5) {
        component.useWord({ word: 'wrongWord' })
      } else {
        component.useWord({ word: word })
      }
    })

    expect(component.isFull()).toBeTruthy()
    expect(component.isCorrect()).toBeFalsy()
  }))

  it('should validate a mnemonic where the same word appears 2 times', async(() => {
    component.secret = correctMnemonic
    fixture.detectChanges()
    component.ngOnInit()
    const words = component.secret.split(' ')

    words.forEach((word, i) => {
      component.useWord({ word: word })
    })

    expect(component.isCorrect()).toBeTruthy()
  }))

  it('should not validate user input that is too short', async(() => {
    component.secret = correctMnemonic
    fixture.detectChanges()
    component.ngOnInit()
    const words = component.secret.split(' ')

    words.forEach((word, i) => {
      if (i === words.length - 1) return
      component.useWord({ word: word })
    })

    expect(component.isFull()).toBeFalsy()
    expect(component.isCorrect()).toBeFalsy()
    component.useWord({ word: words[words.length - 1] })
    expect(component.isFull()).toBeTruthy()
    expect(component.isCorrect()).toBeTruthy()
  }))

  it('should give the correct empty spots', async(() => {
    component.secret = correctMnemonic
    fixture.detectChanges()
    component.ngOnInit()
    const words = component.secret.split(' ')

    // first empty spot is zero
    expect(component.emptySpot(component.currentWords)).toEqual(0)

    component.useWord({ word: words[0] })

    // next empty spot is one
    expect(component.emptySpot(component.currentWords)).toEqual(1)
  }))

  it('should let users select words to correct them', async(() => {
    component.secret = correctMnemonic
    fixture.detectChanges()
    component.ngOnInit()
    const words = component.secret.split(' ')

    words.forEach((word, i) => {
      component.useWord({ word: word })
    })

    // now select a word
    component.selectWord(5)
    expect(component.selectedWord).toEqual(5)
    expect(component.currentWords[5]).toEqual({ word: words[5] })
  }))

  it('should give users 3 words to choose from', async(() => {
    component.secret = correctMnemonic
    component.ngOnInit()
    fixture.detectChanges()

    let wordSelector = fixture.nativeElement.querySelector('#wordSelector')

    // check if there are three words
    expect(wordSelector.children.length).toBe(3)

    let foundWord = false
    for (let i = 0; i < wordSelector.children.length; i++) {
      if (wordSelector.children.item(i).textContent.trim() === correctMnemonic.split(' ')[0]) {
        foundWord = true
      }
    }

    // check if one of the words is the correct one
    expect(foundWord).toBeTruthy()
  }))

  it('should give users 3 words to choose from if selecting a specific one', async(() => {
    component.secret = correctMnemonic
    component.ngOnInit()
    fixture.detectChanges()

    component.secret.split(' ').forEach((word, i) => {
      if (i > 10) return
      component.useWord({ word: word })
    })

    const selectedIndex = 5
    component.selectWord(selectedIndex)

    fixture.detectChanges()

    let wordSelector = fixture.nativeElement.querySelector('#wordSelector')

    // check if there are three words
    expect(wordSelector.children.length).toBe(3)

    let foundWord = false
    for (let i = 0; i < wordSelector.children.length; i++) {
      if (wordSelector.children.item(i).textContent.trim() === correctMnemonic.split(' ')[selectedIndex]) {
        foundWord = true
      }
    }

    // check if one of the words is the correct one
    expect(foundWord).toBeTruthy()
  }))
})
