import { Component, Input } from '@angular/core'
import { Secret } from '../../models/secret'

@Component({
  selector: 'secret-item',
  templateUrl: 'secret-item.html'
})
export class SecretItemComponent {
  @Input()
  secret: Secret
}
