import { Component, Input } from '@angular/core'

import { ClipboardService } from './../../services/clipboard/clipboard.service'

@Component({
  selector: 'qr-clipboard',
  templateUrl: './qr-clipboard.component.html',
  styleUrls: ['./qr-clipboard.component.scss']
})
export class QrClipboardComponent {
  @Input()
  public level: string = 'L'

  @Input()
  public qrdata: any = ''

  @Input()
  public size: number = 300

  constructor(private readonly clipboardService: ClipboardService) {}

  public async copyToClipboard() {
    await this.clipboardService.copyAndShowToast(this.qrdata)
  }
}
