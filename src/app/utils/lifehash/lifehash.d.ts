/// <reference types="emscripten" />

import { LifeHashVersion } from './lifehash.types'

export interface LifeHashModule extends EmscriptenModule {
  makeFromUTF8(utf8: string, version: LifeHashVersion, moduleSize: number): HTMLImageElement
  makeFromData(data: Uint8Array, version: LifeHashVersion, moduleSize: number): HTMLImageElement
  makeFromDigest(digest: Uint8Array, version: LifeHashVersion, moduleSize: number): HTMLImageElement
  sha256(s: string): Uint8Array
  dataToHex(data: Uint8Array): string
  hexToData(hex: string): Uint8Array | null
}

export default function instantiate_lifehash(mod?: any): Promise<LifeHashModule>
