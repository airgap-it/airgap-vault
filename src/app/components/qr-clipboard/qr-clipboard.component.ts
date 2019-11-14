import { Component, Input, OnDestroy } from '@angular/core'

import { ClipboardService } from '../../services/clipboard/clipboard.service'

@Component({
  selector: 'airgap-qr-clipboard',
  templateUrl: './qr-clipboard.component.html',
  styleUrls: ['./qr-clipboard.component.scss']
})
export class QrClipboardComponent implements OnDestroy {
  @Input()
  public level: string = 'L'

  public qrdataArray: string[] = ['']

  @Input()
  set qrdata(value: string | string[]) {
    this.qrdataArray = Array.isArray(value) ? value : [value]
  }

  @Input()
  public size: number = 300

  public activeChunk: number = 0

  private readonly timeout: NodeJS.Timeout
  constructor(private readonly clipboardService: ClipboardService) {
    this.timeout = setInterval(() => {
      this.activeChunk = ++this.activeChunk % this.qrdataArray.length
    }, 250)
  }

  public async copyToClipboard(): Promise<void> {
    await this.clipboardService.copyAndShowToast(this.qrdataArray.join(','))
  }

  public ngOnDestroy(): void {
    if (this.timeout) {
      clearInterval(this.timeout)
    }
  }
}
