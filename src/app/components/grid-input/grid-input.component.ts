import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'airgap-grid-input',
  templateUrl: './grid-input.component.html',
  styleUrls: ['./grid-input.component.scss']
})
export class GridInputComponent implements OnInit {
  public grid: { position: number; value: string }[][]
  public caretPosition: number = 0

  @Input()
  public minLength?: number = 0

  @Input()
  public maxLength?: number

  public entropy: string = ''

  @Input()
  public gridWidth: number = 5

  @Input()
  private defaultHeight: number = 4

  public calculatedWidth: string = '20%'

  @Output()
  public rowAddedEvent = new EventEmitter()

  @Output()
  public entropyChanged = new EventEmitter<string>()

  constructor() {}

  ngOnInit() {
    this.createGrid()
    this.calculatedWidth = (100 / this.gridWidth).toString() + '%'
  }

  async add(char: string): Promise<void> {
    if (this.caretPosition >= this.entropy.length) {
      this.entropy += char
    } else {
      const str = this.entropy
      this.entropy = str.substring(0, this.caretPosition + 1) + char + str.substring(this.caretPosition + 1)
    }
    const nextPosition = this.caretPosition + 1
    this.setCaret(nextPosition)
    this.calculateGrid()
  }

  async remove(): Promise<void> {
    if (this.caretPosition >= this.entropy.length) {
      const len = this.entropy.length
      this.entropy = this.entropy.substring(0, len - 1)
    } else {
      const str = this.entropy
      this.entropy = str.substring(0, this.caretPosition) + str.substring(this.caretPosition + 1)
    }
    const nextPosition = this.caretPosition - 1
    this.setCaret(nextPosition)
    this.calculateGrid()
  }

  async setCaret(position: number): Promise<void> {
    this.caretPosition =
      position >= this.maxLength ? this.maxLength - 1 : position > this.entropy.length ? this.entropy.length : position < 0 ? 0 : position
  }

  private async calculateGrid() {
    const gridWidth = this.gridWidth
    const maxLength = Math.min(this.entropy.length + 1, this.maxLength ?? Number.MAX_SAFE_INTEGER)
    const gridHeight = Math.ceil(maxLength / gridWidth)
    if (gridHeight > this.grid.length) {
      this.createGrid(gridHeight)
      this.rowAddedEvent.emit()
    } else {
      let i = 0
      for (let x = 0; x < this.grid.length; x++) {
        for (let y = 0; y < this.grid[x].length; y++) {
          const newValue = this.entropy[i]
          if (this.grid[x][y].value !== newValue) {
            this.grid[x][y].value = newValue
          }
          i++
        }
      }
    }

    this.entropyChanged.emit(this.entropy)
  }

  private createGrid(gridHeight: number = 0) {
    this.grid = [...new Array(Math.max(this.defaultHeight, gridHeight))].map((_, i) =>
      [...new Array(this.gridWidth)].map((_, y) => ({ position: i * this.gridWidth + y, value: this.entropy[i * this.gridWidth + y] }))
    )
  }
}
