import { Inject, Injectable } from '@angular/core'
import { HapticsPlugin, ImpactStyle } from '@capacitor/haptics'
import { Platform } from '@ionic/angular'

import { HAPTICS_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'

@Injectable({
  providedIn: 'root'
})
export class ScanFeedbackService {
  constructor(private readonly platform: Platform, @Inject(HAPTICS_PLUGIN) private readonly haptics: HapticsPlugin) {}

  public notifyFrameAccepted(): void {
    if (!this.platform.is('android')) {
      return
    }

    void this.haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined)
  }
}
