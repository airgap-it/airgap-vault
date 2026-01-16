import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { VerifyKeyAltComponent } from './verify-key-alt.component'

describe('Component: VerifyKey', () => {
  let component: VerifyKeyAltComponent
  let fixture: ComponentFixture<VerifyKeyAltComponent>

  const correctMnemonic: string =
    'usage puzzle bottom amused genuine bike brown ripple lend aware symbol genuine neutral tortoise pluck rose brown cliff sing smile appear black occur zero'

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: []
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async () => {
    fixture = TestBed.createComponent(VerifyKeyAltComponent)
    component = fixture.componentInstance
  })

  function initComponent(secret: string, autoDetect: boolean = false): void {
    component.secret = secret
    component.ngOnInit()
    if (autoDetect) {
      fixture.autoDetectChanges(true)
    } else {
      fixture.detectChanges()
    }
  }

  it('should validate a regular mnemonic, and emit correct event', waitForAsync(() => {
    initComponent(correctMnemonic)
    const words = component.secret.split(' ')

    // validate onComplete Event is True
    component.onComplete.subscribe((event) => {
      expect(event).toBeTruthy()
    })

    words.forEach((word: string) => {
      expect(component.isFull()).toBeFalsy()
      component.useWord(word)
    })

    expect(component.isFull()).toBeTruthy()
    expect(component.isCorrect()).toBeTruthy()
  }))

  it('should detect a wrong word in a mnemonic', waitForAsync(() => {
    initComponent(correctMnemonic)
    const words = component.secret.split(' ')

    // validate onComplete Event is False
    component.onComplete.subscribe((event) => {
      expect(event).toBeFalsy()
    })

    words.forEach((word: string, i: number) => {
      expect(component.isFull()).toBeFalsy()
      if (i === 5) {
        component.useWord('wrongWord')
      } else {
        component.useWord(word)
      }
    })

    expect(component.isFull()).toBeTruthy()
    expect(component.isCorrect()).toBeFalsy()
  }))

  it('should validate a mnemonic where the same word appears 2 times', waitForAsync(() => {
    initComponent(correctMnemonic)
    const words = component.secret.split(' ')

    words.forEach((word) => {
      component.useWord(word)
    })

    expect(component.isCorrect()).toBeTruthy()
  }))

  it('should not validate user input that is too short', waitForAsync(() => {
    initComponent(correctMnemonic)
    const words: string[] = component.secret.split(' ')

    words.forEach((word: string, i: number) => {
      if (i === words.length - 1) {
        return
      }
      component.useWord(word)
    })

    expect(component.isFull()).toBeFalsy()
    expect(component.isCorrect()).toBeFalsy()
    component.useWord(words[words.length - 1])
    expect(component.isFull()).toBeTruthy()
    expect(component.isCorrect()).toBeTruthy()
  }))

  it('should give the correct empty spots', waitForAsync(() => {
    initComponent(correctMnemonic)
    const words = component.secret.split(' ')

    // first empty spot is zero
    expect(component.emptySpot(component.currentWords)).toEqual(0)

    component.useWord(words[0])

    // next empty spot is one
    expect(component.emptySpot(component.currentWords)).toEqual(1)
  }))

  it('should let users select words to correct them', waitForAsync(() => {
    initComponent(correctMnemonic)
    const words = component.secret.split(' ')

    words.forEach((word: string) => {
      component.useWord(word)
    })

    // now select a word
    component.selectWord(5)
    expect(component.selectedWordIndex).toEqual(5)
    expect(component.currentWords[5]).toEqual(words[5])
  }))

  it('should give users 3 words to choose from', waitForAsync(() => {
    initComponent(correctMnemonic)

    const wordSelector = fixture.nativeElement.querySelector('#wordSelector')

    // check if there are three words
    expect(wordSelector.children.length).toBe(3)

    let foundWord: boolean = false
    for (let i: number = 0; i < wordSelector.children.length; i++) {
      if (wordSelector.children.item(i).textContent.trim() === correctMnemonic.split(' ')[0]) {
        foundWord = true
      }
    }

    // check if one of the words is the correct one
    expect(foundWord).toBeTruthy()
  }))

  it('should give users 3 words to choose from if selecting a specific one', waitForAsync(() => {
    initComponent(correctMnemonic, true)

    component.secret.split(' ').forEach((word: string, i: number) => {
      if (i > 10) {
        return
      }
      component.useWord(word)
    })

    const selectedIndex: number = 5
    component.selectWord(selectedIndex)

    // Verify via component state that the correct word is in promptedWords
    const targetWord = correctMnemonic.split(' ')[selectedIndex]
    expect(component.promptedWords.length).toBe(3)
    expect(component.promptedWords).toContain(targetWord)
  }))
})
