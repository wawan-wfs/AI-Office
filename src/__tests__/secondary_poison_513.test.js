// Siklus 513 — anti-poisoning field sekunder task di TeamStats / Dashboard / ShConsole
// (pola seri 504-512). Field non-string (agent_id/role/status) — bentuk sah API —
// tidak boleh dirender mentah sebagai React child (crash) / "[object Object]".
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { fileURLToPath } from 'node:url'
import { dirname, resolve as rslv } from 'node:path'
const SRC = rslv(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(rslv(SRC, p.replace(/^src\//, '')), 'utf8')

// Kontrak helper: replika logika normalizeSecondary di 3 komponen.
const normalizeSecondary = (v) => {
  if (v == null || v === '') return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  try { return JSON.stringify(v) } catch { return '' }
}

describe('normalizeSecondary kontrak (513)', () => {
  it('null/undefined/string kosong → ""', () => {
    expect(normalizeSecondary(null)).toBe('')
    expect(normalizeSecondary(undefined)).toBe('')
    expect(normalizeSecondary('')).toBe('')
  })
  it('string utuh', () => expect(normalizeSecondary('alpha-1')).toBe('alpha-1'))
  it('angka/boolean → String', () => {
    expect(normalizeSecondary(42)).toBe('42')
    expect(normalizeSecondary(true)).toBe('true')
  })
  it('objek/array → JSON (bukan [object Object])', () => {
    expect(normalizeSecondary({ id: 7 })).toBe('{"id":7}')
    expect(normalizeSecondary(['a', 'b'])).toBe('["a","b"]')
  })
})

describe('sweep titik render 513', () => {
  const cases = [
    ['src/components/TeamStats.jsx', ['{t.agent_id}', '{t.status}']],
    ['src/components/Dashboard.jsx', ['{t.agent_id || t.status}']],
    ['src/components/ShConsole.jsx', ['{t.role ||', '{t.agent_id ||', '{t.status}</span>']],
  ]
  it.each(cases)('%s tanpa render mentah field sekunder', (file, patterns) => {
    const src = read(file)
    expect(src).toContain('normalizeSecondary')
    for (const p of patterns) expect(src).not.toContain(p)
  })
  it('semua 3 komponen punya helper normalizeSecondary sendiri', () => {
    for (const f of ['src/components/TeamStats.jsx', 'src/components/Dashboard.jsx', 'src/components/ShConsole.jsx']) {
      expect(read(f)).toMatch(/const normalizeSecondary = \(v\) =>/)
    }
  })
})
