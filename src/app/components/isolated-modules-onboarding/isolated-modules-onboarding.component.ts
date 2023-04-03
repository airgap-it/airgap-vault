import { Component, EventEmitter, Output } from '@angular/core'

@Component({
  selector: 'airgap-isolated-modules-onboarding',
  templateUrl: './isolated-modules-onboarding.component.html',
  styleUrls: ['./isolated-modules-onboarding.component.scss']
})
export class IsolatedModulesOnboardingComponent {
  @Output()
  public onDismissed: EventEmitter<boolean> = new EventEmitter()

  public acknowledge() {
    this.onDismissed.emit(true)
  }
}