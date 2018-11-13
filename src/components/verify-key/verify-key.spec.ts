import { VerifyKeyComponent } from './verify-key'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from 'ionic-angular'

describe('Component: VerifyKey', () => {
  let component: VerifyKeyComponent
  let fixture: ComponentFixture<VerifyKeyComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerifyKeyComponent],
      imports: [IonicModule.forRoot(VerifyKeyComponent)]
    })

    // create component and test fixture
    fixture = TestBed.createComponent(VerifyKeyComponent)

    // get test component from the fixture
    component = fixture.componentInstance
  })
  /*
  it('should validate a regular mnemonic', () => {
    component.secret = 'unhappy bleak gather fragile lab general glory follow sniff hover robot push describe female sense gate smoke include spatial balcony divorce crime output cup'
    console.log(component.secret)

    fixture.detectChanges()
    let words = component.secret.split(' ')

    words.forEach((word, i) => {
      component.useWord({ word: word, index: i, originalIndex: i })
    })
    expect(component.isCorrect()).toBeTruthy()
  })

  it('should validate a mnemonic where the same word appears 2 times', () => {
    component.secret = 'usage puzzle bottom amused genuine bike brown ripple lend aware symbol genuine neutral tortoise pluck rose brown cliff sing smile appear black occur zero'
    fixture.detectChanges()
    component.ngOnInit()
    let words = component.secret.split(' ')

    // Swap 2 words
    let doubleWord = 'genuine'
    let firstPosition = words.indexOf(doubleWord)
    let secondPosition = words.indexOf(doubleWord, firstPosition + 1)

    words.forEach((word, i) => {
      let originalIndex = i
      if (i === firstPosition) originalIndex = secondPosition
      if (i === secondPosition) originalIndex = firstPosition
      component.useWord({ word: word, index: i, originalIndex: originalIndex })
    })

    expect(component.isCorrect()).toBeTruthy()
  })

  it('should not validate user input that is too short', () => {
    component.secret = 'usage puzzle bottom amused genuine bike brown ripple lend aware symbol genuine neutral tortoise pluck rose brown cliff sing smile appear black occur zero'
    fixture.detectChanges()
    component.ngOnInit()
    let words = component.secret.split(' ')

    for (let i = 0; i < words.length - 1; i++) {
      component.useWord({ word: words[i], index: i, originalIndex: i })
    }
    expect(component.isCorrect()).toBeFalsy()
    component.useWord({ word: words[words.length - 1], index: 23, originalIndex: 23 })
    expect(component.isCorrect()).toBeTruthy()
  })

  it('should not validate user input that is too long', () => {
    component.secret = 'usage puzzle bottom amused genuine bike brown ripple lend aware symbol genuine neutral tortoise pluck rose brown cliff sing smile appear black occur zero'
    fixture.detectChanges()
    component.ngOnInit()
    let words = component.secret.split(' ')

    words.forEach((word, i) => {
      component.useWord({ word: word, index: i, originalIndex: i })
    })
    expect(component.isCorrect()).toBeTruthy()
    component.useWord({ word: 'bacon', index: 0, originalIndex: 0 })
    expect(component.isCorrect()).toBeFalsy()
  })

  it('should not validate user input with typo', () => {
    component.secret = 'usage puzzle bottom amused genuine bike brown ripple lend aware symbol genuine neutral tortoise pluck rose brown cliff sing smile appear black occur zero'
    fixture.detectChanges()
    component.ngOnInit()
    let words = component.secret.split(' ')

    words.forEach((word, i) => {
      let insertWord = word
      if (i === 0) insertWord = word.substr(0, word.length - 1)
      component.useWord({ word: insertWord, index: i, originalIndex: i })
    })
    expect(component.isCorrect()).toBeFalsy()
  })

  it('should not validate user input with invalid word', () => {
    component.secret = 'usage puzzle bottom amused genuine bike brown ripple lend aware symbol genuine neutral tortoise pluck rose brown cliff sing smile appear black occur zero'
    fixture.detectChanges()
    component.ngOnInit()
    let words = component.secret.split(' ')

    words.forEach((word, i) => {
      let insertWord = word
      if (i === 0) insertWord = 'guetzli'
      component.useWord({ word: insertWord, index: i, originalIndex: i })
    })
    expect(component.isCorrect()).toBeFalsy()
  })
  */
})
