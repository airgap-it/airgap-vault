import { Component, Input } from '@angular/core'
import { ClipboardProvider } from '../../providers/clipboard/clipboard'

@Component({
  selector: 'qr-clipboard',
  templateUrl: 'qr-clipboard.html'
})
export class QrClipboardComponent {
  @Input()
  level: string = 'L'

  @Input()
  qrdata: any = ''

  @Input()
  size: number = 300

  constructor(private clipboardProvider: ClipboardProvider) {}

  async copyToClipboard() {
    await this.clipboardProvider.copyAndShowToast(this.qrdata)
  }
}
