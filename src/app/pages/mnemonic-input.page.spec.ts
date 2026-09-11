import { ElementRef } from '@angular/core'
import { AlertController } from '@ionic/angular'

import { MnemonicInputPage } from './mnemonic-input.page'

class TestMnemonicInputPage extends MnemonicInputPage {
  public readonly secretContainer: ElementRef<HTMLElement>
  public readonly seedphraseInput: ElementRef<HTMLTextAreaElement>

  constructor(maxWords: number) {
    super(maxWords, {} as AlertController)
  }

  protected isFlowValid(): boolean {
    return true
  }
}

describe('MnemonicInputPage', () => {
  it('normalizes manual text, resets selection, and notifies the keyboard', () => {
    const component = new TestMnemonicInputPage(24)
    component.selectedWordIndex = 3
    component.selectedWord = 'stale'
    const next = spyOn(component.setWordEmitter, 'next')

    component.seedphraseChanged('  ABANDON\n abandon\t abandon  ')

    expect(component.secretWords).toEqual(['abandon', 'abandon', 'abandon'])
    expect(component.selectedWordIndex).toBe(-1)
    expect(component.selectedWord).toBe('')
    expect(next).toHaveBeenCalledWith('')
  })

  it('focuses the text input after enabling it', (done) => {
    const component = new TestMnemonicInputPage(24)
    const focus = jasmine.createSpy('focus')
    ;(component as any).seedphraseInput = { nativeElement: { focus } }
    component.secretWords = ['abandon']

    component.enableTextInput()

    expect(component.regularInputEnabled).toBe(true)
    expect(component.seedphraseText).toBe('abandon')
    setTimeout(() => {
      expect(focus).toHaveBeenCalled()
      done()
    })
  })

  it('uses its configured maximum word count', () => {
    expect(new TestMnemonicInputPage(24).hasValidWordCount(new Array(24))).toBe(true)
    expect(new TestMnemonicInputPage(24).hasValidWordCount(new Array(25))).toBe(false)
    expect(new TestMnemonicInputPage(48).hasValidWordCount(new Array(48))).toBe(true)
    expect(new TestMnemonicInputPage(48).hasValidWordCount(new Array(49))).toBe(false)
  })
})
