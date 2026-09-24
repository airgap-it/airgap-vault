import { Injectable } from '@angular/core'

import { DecodedCall, DecodedParam, DecodedValue, DecodeSource } from './abi-types'

interface AbiType {
  raw: string
  base: 'uint' | 'int' | 'address' | 'bool' | 'bytes' | 'string' | 'bytesN' | 'tuple' | 'array'
  size?: number
  components?: AbiType[]
  arrayChild?: AbiType
  arrayLength?: number
}

@Injectable({ providedIn: 'root' })
export class AbiDecoderService {
  public extractSelector(calldata: string): string | null {
    const hex = stripHexPrefix(calldata).toLowerCase()
    if (hex.length < 8) return null
    return hex.slice(0, 8)
  }

  public decodeWithSignature(calldata: string, signature: string, source: DecodeSource = 'hardcoded'): DecodedCall | null {
    try {
      const hex = stripHexPrefix(calldata).toLowerCase()
      if (hex.length < 8) return null
      const selector = hex.slice(0, 8)
      const body = hex.slice(8)
      const { name, types } = parseSignature(signature)
      const bytes = hexToBytes(body)
      state = { itemBudget: MAX_DECODED_ITEMS, extent: 0 }
      const params = decodeTuple(bytes, types, 0)
      // Reject trailing data beyond the (32-byte padded) decoded extent: a
      // well-formed encoding is fully consumed, so leftovers mean the signature
      // does not really describe this calldata.
      if (roundUp32(state.extent) < bytes.length) throw new Error('trailing data')
      return {
        selector,
        signature,
        functionName: name,
        params,
        source
      }
    } catch {
      return null
    }
  }
}

export function stripHexPrefix(hex: string): string {
  return hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = stripHexPrefix(hex)
  if (clean.length % 2 !== 0) throw new Error('odd hex length')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) {
    const b = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
    if (Number.isNaN(b)) throw new Error('bad hex')
    out[i] = b
  }
  return out
}

export function bytesToHex(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0')
  return s
}

/** Upper bound on decoded values per call, so hostile lengths/offsets cannot hang the UI. */
const MAX_DECODED_ITEMS = 10_000

/** Per-decode bookkeeping. Decoding is synchronous, so a module-level slot is safe. */
let state = { itemBudget: MAX_DECODED_ITEMS, extent: 0 }

function spendItem(): void {
  if (--state.itemBudget < 0) throw new Error('decode budget exceeded')
}

function markExtent(end: number): void {
  if (end > state.extent) state.extent = end
}

function roundUp32(n: number): number {
  return Math.ceil(n / 32) * 32
}

function readWord(bytes: Uint8Array, offset: number): Uint8Array {
  if (offset + 32 > bytes.length) throw new Error('out of bounds')
  markExtent(offset + 32)
  return bytes.slice(offset, offset + 32)
}

/** Read a length/offset word, rejecting anything that cannot fit in the calldata. */
function readSize(bytes: Uint8Array, offset: number): number {
  const v = wordToBigUint(readWord(bytes, offset))
  if (v > BigInt(bytes.length)) throw new Error('size out of bounds')
  return Number(v)
}

/** Resolve a relative offset: must be word-aligned and point at or past the enclosing head. */
function readOffset(bytes: Uint8Array, offset: number, base: number, headSize: number): number {
  const rel = readSize(bytes, offset)
  if (rel % 32 !== 0 || rel < headSize) throw new Error('bad offset')
  return base + rel
}

function wordToBigUint(word: Uint8Array): bigint {
  let v = 0n
  for (let i = 0; i < word.length; i++) v = (v << 8n) | BigInt(word[i])
  return v
}

/**
 * Decode an intN word, requiring canonical sign extension: the whole word read as
 * int256 must fit in N bits, otherwise contracts may see a different value.
 */
function wordToBigInt(word: Uint8Array, bits: number): bigint {
  const u = wordToBigUint(word)
  const v = u >= 1n << 255n ? u - (1n << 256n) : u
  const limit = 1n << BigInt(bits - 1)
  if (v < -limit || v >= limit) throw new Error('non-canonical int')
  return v
}

function isZero(bytes: Uint8Array): boolean {
  for (let i = 0; i < bytes.length; i++) if (bytes[i] !== 0) return false
  return true
}

/** Bytes read from `pos` with `len` checked against the calldata, not silently truncated. */
function readBytes(data: Uint8Array, pos: number): Uint8Array {
  const len = readSize(data, pos)
  const end = pos + 32 + len
  if (end > data.length) throw new Error('bytes out of bounds')
  markExtent(end)
  return data.slice(pos + 32, end)
}

export function parseSignature(sig: string): { name: string; types: AbiType[] } {
  const open = sig.indexOf('(')
  if (open === -1) throw new Error('no params')
  const name = sig.slice(0, open).trim()
  const rest = sig.slice(open)
  const { type } = parseType(rest, 0)
  if (type.base !== 'tuple') throw new Error('expected tuple')
  return { name, types: type.components! }
}

function parseType(s: string, pos: number): { type: AbiType; next: number } {
  if (s[pos] === '(') {
    const components: AbiType[] = []
    pos++
    if (s[pos] === ')') {
      pos++
    } else {
      while (true) {
        const r = parseType(s, pos)
        components.push(r.type)
        pos = r.next
        if (s[pos] === ',') {
          pos++
          continue
        }
        if (s[pos] === ')') {
          pos++
          break
        }
        throw new Error('parse error at ' + pos)
      }
    }
    let type: AbiType = { raw: tupleRaw(components), base: 'tuple', components }
    return wrapArrays(type, s, pos)
  }
  let end = pos
  while (end < s.length && /[a-zA-Z0-9]/.test(s[end])) end++
  const base = s.slice(pos, end)
  if (!base) throw new Error('empty type')
  const t = parseElementaryType(base)
  return wrapArrays(t, s, end)
}

function wrapArrays(inner: AbiType, s: string, pos: number): { type: AbiType; next: number } {
  let current = inner
  while (s[pos] === '[') {
    const close = s.indexOf(']', pos)
    if (close === -1) throw new Error('unclosed [')
    const sizeStr = s.slice(pos + 1, close)
    const len = sizeStr === '' ? undefined : parseInt(sizeStr, 10)
    current = {
      raw: current.raw + (sizeStr === '' ? '[]' : `[${sizeStr}]`),
      base: 'array',
      arrayChild: current,
      arrayLength: len
    }
    pos = close + 1
  }
  return { type: current, next: pos }
}

function tupleRaw(comps: AbiType[]): string {
  return '(' + comps.map(c => c.raw).join(',') + ')'
}

function parseElementaryType(name: string): AbiType {
  if (name === 'address') return { raw: 'address', base: 'address', size: 160 }
  if (name === 'bool') return { raw: 'bool', base: 'bool' }
  if (name === 'string') return { raw: 'string', base: 'string' }
  if (name === 'bytes') return { raw: 'bytes', base: 'bytes' }
  let m = /^uint(\d+)?$/.exec(name)
  if (m) {
    const size = m[1] ? parseInt(m[1], 10) : 256
    return { raw: `uint${size}`, base: 'uint', size }
  }
  m = /^int(\d+)?$/.exec(name)
  if (m) {
    const size = m[1] ? parseInt(m[1], 10) : 256
    return { raw: `int${size}`, base: 'int', size }
  }
  m = /^bytes(\d+)$/.exec(name)
  if (m) {
    const size = parseInt(m[1], 10)
    return { raw: `bytes${size}`, base: 'bytesN', size }
  }
  throw new Error('unknown type ' + name)
}

function isDynamic(t: AbiType): boolean {
  if (t.base === 'bytes' || t.base === 'string') return true
  if (t.base === 'array') {
    if (t.arrayLength === undefined) return true
    return isDynamic(t.arrayChild!)
  }
  if (t.base === 'tuple') return t.components!.some(isDynamic)
  return false
}

function decodeTuple(data: Uint8Array, types: AbiType[], baseOffset: number): DecodedParam[] {
  const out: DecodedParam[] = []
  let headPos = baseOffset
  let headSize = 0
  for (const t of types) headSize += headSizeOf(t)
  for (const t of types) {
    if (isDynamic(t)) {
      const dynOffset = readOffset(data, headPos, baseOffset, headSize)
      const value = decodeValue(data, t, dynOffset)
      out.push({ name: null, type: t.raw, value })
      headPos += 32
    } else {
      const { value, consumed } = decodeStaticAt(data, t, headPos)
      out.push({ name: null, type: t.raw, value })
      headPos += consumed
    }
  }
  return out
}

function decodeStaticAt(data: Uint8Array, t: AbiType, pos: number): { value: DecodedValue; consumed: number } {
  spendItem()
  if (t.base === 'tuple') {
    const fields = decodeTuple(data, t.components!, pos)
    let size = 0
    for (const c of t.components!) size += staticSize(c)
    return { value: { kind: 'tuple', fields }, consumed: size }
  }
  if (t.base === 'array' && t.arrayLength !== undefined && !isDynamic(t.arrayChild!)) {
    const items: DecodedValue[] = []
    let cursor = pos
    for (let i = 0; i < t.arrayLength; i++) {
      const r = decodeStaticAt(data, t.arrayChild!, cursor)
      items.push(r.value)
      cursor += r.consumed
    }
    return { value: { kind: 'array', items }, consumed: cursor - pos }
  }
  return { value: decodeValue(data, t, pos), consumed: 32 }
}

function staticSize(t: AbiType): number {
  if (t.base === 'tuple') {
    let s = 0
    for (const c of t.components!) s += staticSize(c)
    return s
  }
  if (t.base === 'array' && t.arrayLength !== undefined && !isDynamic(t.arrayChild!)) {
    return staticSize(t.arrayChild!) * t.arrayLength
  }
  return 32
}

/** Bytes a type occupies in its enclosing head: an offset word if dynamic, else its static size. */
function headSizeOf(t: AbiType): number {
  return isDynamic(t) ? 32 : staticSize(t)
}

// Every elementary value must be canonically encoded (zero high bits / padding).
// A dirty word is shown differently by this decoder than a contract (e.g. ABI
// coder v1) would interpret it, so it is rejected and the UI falls back to raw hex.
function decodeValue(data: Uint8Array, t: AbiType, pos: number): DecodedValue {
  spendItem()
  switch (t.base) {
    case 'address': {
      const w = readWord(data, pos)
      if (!isZero(w.slice(0, 12))) throw new Error('non-canonical address')
      const addr = '0x' + bytesToHex(w.slice(12))
      return { kind: 'address', value: addr }
    }
    case 'uint': {
      const w = readWord(data, pos)
      const v = wordToBigUint(w)
      if (v >> BigInt(t.size!) !== 0n) throw new Error('non-canonical uint')
      return { kind: 'uint', value: v, display: v.toString(10) }
    }
    case 'int': {
      const w = readWord(data, pos)
      const v = wordToBigInt(w, t.size!)
      return { kind: 'int', value: v, display: v.toString(10) }
    }
    case 'bool': {
      const w = readWord(data, pos)
      if (!isZero(w.slice(0, 31)) || w[31] > 1) throw new Error('non-canonical bool')
      return { kind: 'bool', value: w[31] === 1 }
    }
    case 'bytesN': {
      const w = readWord(data, pos)
      if (!isZero(w.slice(t.size!))) throw new Error('non-canonical bytesN')
      const bytes = w.slice(0, t.size!)
      return { kind: 'bytes', value: bytes, hex: '0x' + bytesToHex(bytes) }
    }
    case 'bytes': {
      const bytes = readBytes(data, pos)
      return { kind: 'bytes', value: bytes, hex: '0x' + bytesToHex(bytes) }
    }
    case 'string': {
      const bytes = readBytes(data, pos)
      return { kind: 'string', value: new TextDecoder('utf-8', { fatal: false }).decode(bytes) }
    }
    case 'array': {
      let len = t.arrayLength
      let dataStart = pos
      const child = t.arrayChild!
      if (len === undefined) {
        len = readSize(data, pos)
        dataStart = pos + 32
        // Each element needs at least one head byte (zero-size elements count as
        // one), so a length that cannot fit in the remaining calldata is bogus.
        if (len * Math.max(1, headSizeOf(child)) > data.length - dataStart) throw new Error('array length out of bounds')
      }
      const items: DecodedValue[] = []
      if (isDynamic(child)) {
        for (let i = 0; i < len; i++) {
          const off = readOffset(data, dataStart + i * 32, dataStart, len * 32)
          items.push(decodeValue(data, child, off))
        }
      } else {
        let cursor = dataStart
        for (let i = 0; i < len; i++) {
          const r = decodeStaticAt(data, child, cursor)
          items.push(r.value)
          cursor += r.consumed
        }
      }
      return { kind: 'array', items }
    }
    case 'tuple': {
      const fields = decodeTuple(data, t.components!, pos)
      return { kind: 'tuple', fields }
    }
  }
  throw new Error('unhandled type ' + t.raw)
}

export function _internals_for_tests() {
  return { parseSignature, isDynamic, hexToBytes, bytesToHex }
}
