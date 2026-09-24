#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Phase 2 of the signature-DB pipeline: pack a flat binary signature DB for
 * offline, on-device lookup. Pure Node, no dependencies — safe to run in CI.
 *
 * Sources, in order of precedence (highest wins per selector):
 *   1. scripts/signatures.seed.json            (hand-curated canonical names)
 *   2. scripts/signatures.curated.ndjson.gz    (Sourcify export, phase 1)
 *
 * The curated artifact is produced by scripts/refresh-signatures-sourcify.py
 * (the heavy, occasionally-run step). This script just packs it, so a normal
 * `yarn build` stays fast, dependency-free and fully reproducible.
 *
 * If the curated artifact is missing, the build falls back to seed-only so the
 * app still builds (decoder degrades to the curated ERC set + raw hex).
 *
 * Env:
 *   SIGDB_VERIFY       = 1 -> after build, verify sha256 against signatures.lock.json.
 *                              Exits non-zero on mismatch. Use in release CI.
 *   SIGDB_UPDATE_LOCK  = 1 -> rewrite scripts/signatures.lock.json with new sha256.
 *   SIGDB_FAIL_IF_EMPTY= 1 -> exit non-zero if final DB has 0 entries.
 *
 * Output:
 *   src/assets/evm/signatures.db        (gitignored, regenerated each build)
 *   src/assets/evm/signatures.meta.json (gitignored)
 *
 * Binary file format (little-endian) — see signature-database.service.ts:
 *   magic[4]='A4BY' | version u32 | count u32 | index[count*8] | blob[..]
 *   index entry  = 4-byte selector + u32 blob offset (sorted by selector ASC)
 *   blob entry   = u16 collisions + u16 length + UTF-8 signature
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const crypto = require('crypto')

const OUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'evm')
const OUT_DB = path.join(OUT_DIR, 'signatures.db')
const OUT_META = path.join(OUT_DIR, 'signatures.meta.json')
const SEED = path.join(__dirname, 'signatures.seed.json')
const CURATED = path.join(__dirname, 'signatures.curated.ndjson.gz')
const CURATED_META = path.join(__dirname, 'signatures.curated.meta.json')
const LOCK = path.join(__dirname, 'signatures.lock.json')

const VERIFY = process.env.SIGDB_VERIFY === '1'
const UPDATE_LOCK = process.env.SIGDB_UPDATE_LOCK === '1'
const FAIL_IF_EMPTY = process.env.SIGDB_FAIL_IF_EMPTY === '1'

const FORMAT_VERSION = 2

/**
 * Load the Sourcify-derived curated list. Each NDJSON line is
 * { selector, signature, collisions }. Returns Map<selector, {signature, collisions}>.
 */
function loadCurated() {
  const out = new Map()
  if (!fs.existsSync(CURATED)) return out
  const text = zlib.gunzipSync(fs.readFileSync(CURATED)).toString('utf8')
  for (const line of text.split('\n')) {
    if (!line) continue
    let row
    try {
      row = JSON.parse(line)
    } catch {
      continue
    }
    const sel = (row.selector || '').replace(/^0x/i, '').toLowerCase()
    if (!/^[0-9a-f]{8}$/.test(sel) || !row.signature) continue
    out.set(sel, {
      signature: row.signature,
      collisions: Math.max(1, Math.min(Number(row.collisions) || 1, 0xffff))
    })
  }
  return out
}

/**
 * Hand-curated canonical names. These win over the export so the most common
 * selectors always render with the expected human name.
 */
function loadSeed() {
  if (!fs.existsSync(SEED)) return new Map()
  const arr = JSON.parse(fs.readFileSync(SEED, 'utf8'))
  const out = new Map()
  for (const item of arr) {
    const sel = (item.selector || '').replace(/^0x/i, '').toLowerCase()
    if (!/^[0-9a-f]{8}$/.test(sel) || !item.signature) continue
    if (!out.has(sel)) out.set(sel, { signature: item.signature, collisions: 1 })
  }
  return out
}

/**
 * Defensive self-check: a seed signature whose keccak256 does not match its
 * selector is a typo/mismapping (this is exactly how 1f931c1c was found to be
 * diamondCut, not multicall). Warn rather than fail, and skip silently if the
 * hash lib is unavailable at build time so the build never breaks on this.
 */
function validateSeedSelectors(seed) {
  let keccak256
  try {
    keccak256 = require('js-sha3').keccak256
  } catch {
    return
  }
  for (const [sel, s] of seed) {
    const expected = keccak256(s.signature).slice(0, 8)
    if (expected !== sel) {
      console.warn(`WARN: seed selector 0x${sel} != keccak256("${s.signature}") = 0x${expected} — fix scripts/signatures.seed.json`)
    }
  }
}

/** Seed overrides curated; seed's collision count is the max of the two. */
function merge(curated, seed) {
  for (const [sel, s] of seed) {
    const existing = curated.get(sel)
    curated.set(sel, {
      signature: s.signature,
      collisions: Math.max(s.collisions, existing ? existing.collisions : 1)
    })
  }
  return curated
}

function writeBinary(map) {
  const entries = [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  const count = entries.length
  const blobChunks = []
  const offsets = []
  let blobLen = 0
  for (const [, v] of entries) {
    const sigBytes = Buffer.from(v.signature, 'utf8')
    if (sigBytes.length > 0xffff) continue
    offsets.push(blobLen)
    const header = Buffer.alloc(4)
    header.writeUInt16LE(v.collisions, 0)
    header.writeUInt16LE(sigBytes.length, 2)
    blobChunks.push(header, sigBytes)
    blobLen += 4 + sigBytes.length
  }
  const header = Buffer.alloc(12)
  header.write('A4BY', 0, 4, 'ascii')
  header.writeUInt32LE(FORMAT_VERSION, 4)
  header.writeUInt32LE(count, 8)
  const index = Buffer.alloc(count * 8)
  for (let i = 0; i < count; i++) {
    const sel = entries[i][0]
    index.writeUInt8(parseInt(sel.slice(0, 2), 16), i * 8 + 0)
    index.writeUInt8(parseInt(sel.slice(2, 4), 16), i * 8 + 1)
    index.writeUInt8(parseInt(sel.slice(4, 6), 16), i * 8 + 2)
    index.writeUInt8(parseInt(sel.slice(6, 8), 16), i * 8 + 3)
    index.writeUInt32LE(offsets[i], i * 8 + 4)
  }
  return Buffer.concat([header, index, ...blobChunks])
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

function checkLock(hash, count, source) {
  if (!fs.existsSync(LOCK)) return { ok: !VERIFY, reason: 'no lock file' }
  const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'))
  if (lock.sha256 !== hash) return { ok: false, reason: `sha256 mismatch (expected ${lock.sha256}, got ${hash})` }
  if (lock.count !== count) return { ok: false, reason: `count mismatch (expected ${lock.count}, got ${count})` }
  if (lock.source !== source) return { ok: false, reason: `source mismatch (expected ${lock.source}, got ${source})` }
  return { ok: true }
}

function writeLock(hash, count, source) {
  fs.writeFileSync(
    LOCK,
    JSON.stringify({ sha256: hash, count, source, formatVersion: FORMAT_VERSION }, null, 2) + '\n'
  )
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const curated = loadCurated()
  const seed = loadSeed()
  validateSeedSelectors(seed)
  const merged = merge(curated, seed)

  let sourceLabel = 'seed'
  let sourcifyExportDate = new Date().toISOString().slice(0, 10)
  if (curated.size > 0) {
    sourceLabel = 'sourcify'
    if (fs.existsSync(CURATED_META)) {
      try {
        const cm = JSON.parse(fs.readFileSync(CURATED_META, 'utf8'))
        if (cm.sourcifyExportDate) sourcifyExportDate = cm.sourcifyExportDate
      } catch {
        /* ignore */
      }
    }
  } else {
    console.warn('WARN: curated list missing, building seed-only. Run scripts/refresh-signatures-sourcify.py first.')
  }

  if (merged.size === 0 && FAIL_IF_EMPTY) {
    console.error('ERROR: SIGDB_FAIL_IF_EMPTY set and DB is empty')
    process.exit(2)
  }

  const buf = writeBinary(merged)
  fs.writeFileSync(OUT_DB, buf)
  const hash = sha256(buf)
  const meta = {
    generatedAt: new Date().toISOString(),
    sourcifyExportDate,
    totalSignatures: merged.size,
    schemaVersion: FORMAT_VERSION,
    source: sourceLabel,
    sha256: hash
  }
  fs.writeFileSync(OUT_META, JSON.stringify(meta, null, 2) + '\n')

  console.log('---')
  console.log('source        :', sourceLabel)
  console.log('entries       :', merged.size)
  console.log('size          :', (buf.length / 1024 / 1024).toFixed(2), 'MB')
  console.log('sha256        :', hash)
  console.log('output        :', OUT_DB)

  if (UPDATE_LOCK) {
    writeLock(hash, merged.size, sourceLabel)
    console.log('lock updated  :', LOCK)
  } else if (VERIFY) {
    const r = checkLock(hash, merged.size, sourceLabel)
    if (!r.ok) {
      console.error('VERIFY FAILED:', r.reason)
      process.exit(3)
    }
    console.log('lock verified : ok')
  }
}

main()
