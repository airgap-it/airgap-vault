import { Directive, ElementRef, Renderer } from '@angular/core'
import { Config } from '@ionic/angular'

@Directive({
  selector: 'ion-text-avatar'
})
export class IonTextAvatar {
  constructor(config: Config, elementRef: ElementRef, renderer: Renderer) {}
}
