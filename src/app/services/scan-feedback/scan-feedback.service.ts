import { Injectable } from '@angular/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Platform } from '@ionic/angular'

@Injectable({
  providedIn: 'root'
})
export class ScanFeedbackService {
  constructor(private readonly platform: Platform) {}

  public notifyFrameAccepted(): void {
    if (!this.platform.is('android')) {
      return
    }

    void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined)
  }
}
