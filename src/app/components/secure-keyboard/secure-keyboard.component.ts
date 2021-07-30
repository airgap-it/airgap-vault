import { ClipboardService } from '@airgap/angular-core'
import { Component, Input, OnInit } from '@angular/core'

const NUMBERS = '0123456789'
const ALPHABET = 'qwertyuiopasdfghjklzxcvbnm'
// const SPECIAL_CHARS = `-/:;()$&@".,?!'` // 10 / 5
// const SPECIAL_CHARS = `[]{}#%^*+=_\|~<>€£¥•` // 10 / 10

function shuffle(arr: string): string {
  const array = arr.split('')
  let currentIndex = array.length
  let randomIndex

  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array.join('')
}

interface Letter {
  letter: string
  enabled: boolean
  active: boolean
}

@Component({
  selector: 'airgap-secure-keyboard',
  templateUrl: './secure-keyboard.component.html',
  styleUrls: ['./secure-keyboard.component.scss']
})
export class SecureKeyboardComponent implements OnInit {
  public text: string = ''
  public caretPosition: number = 0

  @Input()
  public showNumbers: boolean = true // TODO: false

  public rows: Letter[][]

  public scrambled: boolean = false
  public shift: boolean = false

  constructor(private readonly clipboardService: ClipboardService) {
    this.paintKeyboard()
  }

  ngOnInit() {}

  public async paintKeyboard() {
    let alphabet = this.showNumbers ? NUMBERS + ALPHABET : ALPHABET

    const letters = (this.scrambled ? shuffle(alphabet) : alphabet).split('').map((letter) => {
      return { letter, enabled: true, active: false }
    })

    const firstRow = 10
    const secondRow = 9
    const thirdRow = 7
    const newRows = []
    if (this.showNumbers) {
      newRows.push(letters.splice(0, firstRow))
    }
    newRows.push(letters.splice(0, firstRow))
    newRows.push(letters.splice(0, secondRow))
    newRows.push([...letters.splice(0, thirdRow), { letter: '{backspace}', enabled: true, active: false }])
    newRows.push([
      { letter: '{shift}', enabled: true, active: this.shift },
      { letter: '{space}', enabled: true, active: false }
    ])

    this.updateRows(newRows)
  }

  public selectLetter(letter: string) {
    if (letter === '{shift}') {
      this.shift = !this.shift
      this.paintKeyboard()
    } else if (letter === '{space}') {
      this.add(' ')
    } else if (letter === '{backspace}') {
      this.remove()
    } else {
      this.add(letter)
    }
  }

  private add(char: string) {
    const charToAdd: string = this.shift ? char.toUpperCase() : char
    if (this.caretPosition >= this.text.length) {
      this.text += charToAdd
    } else {
      const str = this.text
      this.text = str.substring(0, this.caretPosition + 1) + charToAdd + str.substring(this.caretPosition + 1)
    }
    const nextPosition = this.caretPosition + 1
    this.setCaret(nextPosition)
  }

  async remove(): Promise<void> {
    console.log('caret', this.caretPosition)
    if (this.caretPosition === 0) {
      console.log('IGNORING, POSITION 0')
      return
    } else if (this.caretPosition >= this.text.length) {
      const len = this.text.length
      this.text = this.text.substring(0, len - 1)
    } else {
      const str = this.text
      this.text = str.substring(0, this.caretPosition) + str.substring(this.caretPosition + 1)
    }
    const nextPosition = this.caretPosition - 1
    this.setCaret(nextPosition)
  }

  async setCaret(position: number): Promise<void> {
    const maxLength = this.text.length
    this.caretPosition = position > maxLength ? maxLength - 1 : position > this.text.length ? this.text.length : position < 0 ? 0 : position

    this.paintKeyboard()
  }

  async paste(): Promise<void> {
    this.text = await this.clipboardService.paste()
    this.caretPosition = this.text.length
  }

  async copy(): Promise<void> {
    this.clipboardService.copyAndShowToast(this.text)
  }

  async reset(): Promise<void> {
    this.text = ''
    this.caretPosition = 0
  }

  async toggleScrambled() {
    this.scrambled = !this.scrambled
    this.paintKeyboard()
  }

  private updateRows(newRows: Letter[][]) {
    if (!this.rows) {
      this.rows = newRows
    } else {
      if (this.rows.length !== newRows.length) {
        this.rows = newRows
        return
      }
      for (let i = 0; i < newRows.length; i++) {
        if (this.rows[i].length !== newRows[i].length) {
          this.rows = newRows
          return
        }
        for (let k = 0; k < newRows[i].length; k++) {
          if (newRows[i][k] === this.rows[i][k]) {
            continue
          } else {
            this.rows[i][k].letter = newRows[i][k].letter
            this.rows[i][k].enabled = newRows[i][k].enabled
            this.rows[i][k].active = newRows[i][k].active
          }
        }
      }
    }
  }
}
