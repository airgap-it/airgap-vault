import { Directive, ElementRef, Renderer } from '@angular/core'
import { Config, Ion } from 'ionic-angular'

@Directive({
  selector: 'ion-text-avatar'
})
export class IonTextAvatar extends Ion {
  constructor(config: Config, elementRef: ElementRef, renderer: Renderer) {
    super(config, elementRef, renderer, 'ion-text-avatar')
  }
}
