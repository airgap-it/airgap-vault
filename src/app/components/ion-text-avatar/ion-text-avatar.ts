import { Config } from '@ionic/angular'
import { Directive, ElementRef, Renderer } from '@angular/core'

@Directive({
  selector: 'ion-text-avatar'
})
export class IonTextAvatar {
  constructor(config: Config, elementRef: ElementRef, renderer: Renderer) {}
}
