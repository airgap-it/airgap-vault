import { Injectable } from '@angular/core'

@Injectable()
export class ClipboardBrowserProvider {
  async copy(text: string) {
    try {
      await (navigator as any).clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }
}
