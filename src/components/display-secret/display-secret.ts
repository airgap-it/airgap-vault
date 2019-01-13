import { Component, Input } from '@angular/core'

@Component({
  selector: 'display-secret',
  templateUrl: 'display-secret.html'
})
export class DisplaySecretComponent {
  @Input()
  secret: string

  splitSecret: string[]

  constructor() {}

  ngOnInit() {
    this.splitSecret = this.secret.split(' ')
  }
}
