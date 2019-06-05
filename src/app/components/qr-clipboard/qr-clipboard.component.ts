import { Component, Input } from '@angular/core'
import { ClipboardService } from './../../services/clipboard/clipboard.service'

@Component({
  selector: 'qr-clipboard',
  templateUrl: './qr-clipboard.component.html',
  styleUrls: ['./qr-clipboard.component.scss']
})
export class QrClipboardComponent {
  @Input()
  level: string = 'L'

  @Input()
  qrdata: any = ''

  @Input()
  size: number = 300

  constructor(private clipboardService: ClipboardService) {}

  async copyToClipboard() {
    await this.clipboardService.copyAndShowToast(this.qrdata)
  }
}
