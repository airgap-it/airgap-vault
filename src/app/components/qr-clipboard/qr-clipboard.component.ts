import { Component, Input, OnDestroy } from '@angular/core'

import { ClipboardService } from '../../services/clipboard/clipboard.service'
import { SerializerService } from '../../services/serializer/serializer.service'
import { serializedDataToUrlString } from '../../utils/utils'

@Component({
  selector: 'airgap-qr-clipboard',
  templateUrl: './qr-clipboard.component.html',
  styleUrls: ['./qr-clipboard.component.scss']
})
export class QrClipboardComponent implements OnDestroy {
  private _rawValue: string | string[]
  private _shouldPrefixSingleQrWithUrl: boolean = true

  @Input()
  public level: string = 'L'

  public qrdataArray: string[] = ['']

  @Input()
  set qrdata(value: string | string[]) {
    this._rawValue = value
    this.convertToDataArray()
  }

  @Input()
  set shouldPrefixSingleQrWithUrl(value: boolean) {
    this._shouldPrefixSingleQrWithUrl = value
    this.convertToDataArray()
  }

  @Input()
  public size: number = 300

  public activeChunk: number = 0

  private readonly timeout: NodeJS.Timeout
  constructor(private readonly clipboardService: ClipboardService, private readonly serializerService: SerializerService) {
    this.timeout = setInterval(() => {
      this.activeChunk = ++this.activeChunk % this.qrdataArray.length
    }, this.serializerService.displayTimePerChunk)
  }

  private convertToDataArray(): void {
    const array: string[] = Array.isArray(this._rawValue) ? this._rawValue : [this._rawValue]
    if (array.length === 1) {
      const chunk: string = array[0]
      const shouldPrefix: boolean = !chunk.includes('://') && this._shouldPrefixSingleQrWithUrl

      this.qrdataArray = [shouldPrefix ? serializedDataToUrlString(chunk) : chunk]
    } else {
      this.qrdataArray = array
    }
  }

  public async copyToClipboard(): Promise<void> {
    let copyString: string = ''
    if (this._rawValue.length === 1) {
      const chunk: string = this._rawValue[0]
      const shouldPrefix: boolean = !chunk.includes('://') && this._shouldPrefixSingleQrWithUrl

      copyString = shouldPrefix ? serializedDataToUrlString(chunk) : chunk
    } else {
      copyString = typeof this._rawValue === 'string' ? this._rawValue : this._rawValue.join(',')
    }

    await this.clipboardService.copyAndShowToast(copyString)
  }

  public ngOnDestroy(): void {
    if (this.timeout) {
      clearInterval(this.timeout)
    }
  }
}
