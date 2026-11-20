import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

// Siklus 673: negosiasi encoding brotli > gzip untuk aset & shell HTML.
// Browser modern kirim 'br' di Accept-Encoding; gzip tetap jalur fallback
// (klien lama / runtime tanpa binding brotli).

const here = fileURLToPath(new URL('.', import.meta.url))
const REPO = resolve(here, '../..')
const SS = resolve(REPO, 'backend/static_serve.py')
const HQ = resolve(REPO, 'backend_live/wfs_hq_server.py')

describe('encoding brotli > gzip (siklus 673)', () => {
  const ss = readFileSync(SS, 'utf-8')
  const hq = readFileSync(HQ, 'utf-8')

  it('static_serve punya _encode_payload dgn brotli + fallback gzip', () => {
    expect(ss).toContain('def _encode_payload(')
    expect(ss).toContain('import brotli as _brotli')
    expect(ss).toContain('except ImportError')
    // fallback wajib tetap lewat maybe_gzip (bukan duplikasi logika gzip).
    expect(ss).toContain('maybe_gzip(data, "fallback.js", accept_encoding)')
  })

  it('satu helper dipakai tiga titik kirim di server produksi', () => {
    expect(hq.match(/static_serve\._encode_payload\(/g)?.length).toBe(3)
    // tidak ada sisa jalur gzip-only yang mengabaikan br.
    expect(hq).not.toContain('static_serve.maybe_gzip(')
    expect(hq).not.toContain('static_serve.gzip_html(')
  })

  it('header encoding dinamis (enc), Vary tetap Accept-Encoding', () => {
    expect(hq.match(/send_header\("Content-Encoding", enc\)/g)?.length).toBe(3)
    expect(hq.match(/send_header\("Vary", "Accept-Encoding"\)/g)?.length).toBe(3)
  })
})
