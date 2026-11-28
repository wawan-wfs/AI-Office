// Siklus 570 — guard sisa interpolasi ID mentah di formatLogText (storage_prefs).
// Pasca 557/566: baris 'Salin/unduh log' memakai `#${x.id}` MENTAH — id objek
// bentuk sah dari API → '#[object Object]' di teks ekspor. Kontrak: via
// normalizeClipText (satu sumber clip.js), tanpa perubahan perilaku string/number.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatLogText } from '../lib/storage_prefs.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(resolve(__dirname, '../lib/storage_prefs.js'), 'utf8')

describe('siklus 570 — id log Salin/unduh ternormalisasi', () => {
  it('id objek → JSON, bukan [object Object]', () => {
    const out = formatLogText([{ t: 1764330000000, id: { sec: 1 }, label: 'Deploy', title: 'build' }])
    expect(out).not.toContain('[object Object]')
    expect(out).toContain('#{"sec":1}')
  })

  it('id string/number utuh, tanpa id → [?]', () => {
    expect(formatLogText([{ t: 'x', id: 42, label: 'L', title: 'T' }])).toContain('#42')
    expect(formatLogText([{ t: 'x', label: 'L', title: 'T' }])).toContain('[?]')
  })

  it('anti-regresi: sumber tidak lagi memakai #{x.id} mentah', () => {
    expect(src).not.toMatch(/#\$\{\s*x\.id\s*\}/)
    expect(src).toContain('`#${normalizeClipText(x.id)}`')
  })
})
