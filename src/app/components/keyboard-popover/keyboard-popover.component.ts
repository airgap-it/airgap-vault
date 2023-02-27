import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'airgap-keyboard-popover',
  templateUrl: './keyboard-popover.component.html',
  styleUrls: ['./keyboard-popover.component.scss']
})
export class KeyboardPopoverComponent implements OnInit {
  private readonly onAdd: Function
  private readonly onClick: Function
  private readonly onDelete: Function
  private readonly onScramble: Function
  private readonly onShowWordlist: Function
  private readonly onToggleShuffled: Function

  public maskWords: boolean = false

  constructor() {}

  ngOnInit() {}

  add() {
    if (this.onAdd) {
      this.onAdd()
      this.onClick()
    }
  }

  delete() {
    if (this.onDelete) {
      this.onDelete()
      this.onClick()
    }
  }

  scramble() {
    if (this.onScramble) {
      this.onScramble()
      this.onClick()
    }
  }

  showWordlist() {
    if (this.onShowWordlist) {
      this.onClick()
      this.onShowWordlist()
    }
  }

  toggleShuffled() {
    if (this.onToggleShuffled) {
      this.onToggleShuffled()
      this.onClick()
    }
  }
}
