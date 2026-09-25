import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'

import { SignatureDatabaseMetadata, SignatureLookupResult } from './abi-types'
import { hexToBytes } from './abi-decoder.service'

/**
 * Flat binary signature DB.
 *
 * File layout (little-endian):
 *   magic    [4]    = 'A4BY'
 *   version  [u32]  = 2
 *   count    [u32]  number of entries
 *   index    [count * 8]  -> repeated: 4-byte selector + 4-byte u32 offset into blob
 *   blob     [..]   -> repeated: u16 collisions + u16 length + UTF-8 signature bytes
 *
 * Index is sorted by selector ASC. Lookup = binary search.
 * Each selector appears at most once (oldest-first dedup at build time).
 * `collisions` is how many distinct signatures the build script saw for this
 * selector before dedup — surfaced in the UI as an ambiguity warning.
 */
@Injectable({ providedIn: 'root' })
export class SignatureDatabaseService {
  private buffer: Uint8Array | null = null
  private view: DataView | null = null
  private count = 0
  private indexStart = 12
  private blobStart = 0
  private metadata: SignatureDatabaseMetadata | null = null
  private initPromise: Promise<void> | null = null

  constructor(private readonly http: HttpClient) {}

  public initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise
    this.initPromise = this.load()
    return this.initPromise
  }

  public async lookup(selector: string): Promise<SignatureLookupResult | null> {
    await this.initialize()
    if (!this.buffer || !this.view) return null
    const clean = selector.replace(/^0x/i, '').toLowerCase()
    if (clean.length !== 8) return null
    const target = hexToBytes(clean)
    const idx = this.binarySearch(target)
    if (idx < 0) return null
    const off = this.view.getUint32(this.indexStart + idx * 8 + 4, true)
    const blobPos = this.blobStart + off
    if (blobPos + 4 > this.buffer.byteLength) return null
    const collisions = this.view.getUint16(blobPos, true)
    const len = this.view.getUint16(blobPos + 2, true)
    if (blobPos + 4 + len > this.buffer.byteLength) return null
    const sigBytes = this.buffer.slice(blobPos + 4, blobPos + 4 + len)
    let signature: string
    try {
      signature = new TextDecoder('utf-8', { fatal: true }).decode(sigBytes)
    } catch {
      return null
    }
    return { signature, selector: clean, collisions }
  }

  public async getMetadata(): Promise<SignatureDatabaseMetadata | null> {
    if (this.metadata) return this.metadata
    await this.initialize()
    return this.metadata
  }

  private async load(): Promise<void> {
    try {
      const [dbBuf, meta] = await Promise.all([
        firstValueFrom(this.http.get('assets/evm/signatures.db', { responseType: 'arraybuffer' })),
        firstValueFrom(this.http.get<SignatureDatabaseMetadata>('assets/evm/signatures.meta.json'))
      ])
      this.buffer = new Uint8Array(dbBuf)
      this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength)
      if (this.buffer.byteLength < 12) throw new Error('truncated header')
      const magic = String.fromCharCode(this.buffer[0], this.buffer[1], this.buffer[2], this.buffer[3])
      if (magic !== 'A4BY') throw new Error('bad magic')
      const version = this.view.getUint32(4, true)
      if (version !== 2) throw new Error('unsupported db version ' + version)
      this.count = this.view.getUint32(8, true)
      this.indexStart = 12
      this.blobStart = this.indexStart + this.count * 8
      if (this.blobStart > this.buffer.byteLength) throw new Error('truncated index')
      this.metadata = meta
    } catch (e) {
      console.warn('SignatureDatabase: failed to load, decoder will fall back to raw hex', e)
      this.buffer = null
      this.view = null
    }
  }

  private binarySearch(target: Uint8Array): number {
    if (!this.view) return -1
    let lo = 0
    let hi = this.count - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const cmp = this.compareSelectorAt(mid, target)
      if (cmp === 0) return mid
      if (cmp < 0) lo = mid + 1
      else hi = mid - 1
    }
    return -1
  }

  private compareSelectorAt(idx: number, target: Uint8Array): number {
    const off = this.indexStart + idx * 8
    for (let i = 0; i < 4; i++) {
      const a = this.buffer![off + i]
      const b = target[i]
      if (a !== b) return a - b
    }
    return 0
  }

}
