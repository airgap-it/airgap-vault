import { Component, Input } from '@angular/core'

import { Secret } from '../../models/secret'
import { InteractionSetting } from '../../services/interaction/interaction.service'

@Component({
  selector: 'airgap-secret-item',
  templateUrl: './secret-item.component.html',
  styleUrls: ['./secret-item.component.scss']
})
export class SecretItemComponent {
  @Input()
  public secret: Secret

  public interactionSetting: typeof InteractionSetting = InteractionSetting
}
