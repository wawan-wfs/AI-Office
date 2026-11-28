import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeClipText } from '../lib/clip.js'

// Siklus 575 — semua React key dari .id harus ternormalisasi:
// id objek bentuk sah API → key '[object Object]' duplikat → render aneh/swap DOM.

const norm = (s) => String(normalizeClipText(s))

describe('siklus 575: normalisasi key React dari .id', () => {
  it('objek → JSON string, bukan "[object Object]"', () => {
    expect(norm({})).not.toBe('[object Object]')
    expect(norm({ a: 1 })).not.toContain('[object Object]')
    expect(norm({})).toBe('{}')
  })

  it('null/undefined → fallback aman', () => {
    expect(norm(null)).toBe('')
    expect(norm(undefined)).toBe('')
    expect(norm(null)).not.toBe('null')
  })

  it('string/number id tidak berubah', () => {
    expect(norm('t-12')).toBe('t-12')
    expect(norm(42)).toBe('42')
  })

  it('anti-regresi: komponen utama tanpa key={x.id} mentah', () => {
    const files = [
      'src/components/ShConsole.jsx',
      'src/components/TaskBoard.jsx',
      'src/components/Dashboard.jsx',
      'src/components/TeamStats.jsx',
      'src/components/ProjectPanel.jsx',
      'src/components/SecureProjectPanel.jsx',
    ]
    for (const f of files) {
      const src = readFileSync(f, 'utf8')
      expect(src, `${f} masih memakai key={x.id} mentah`).not.toMatch(/key=\{[a-z]+\.(id)\}/)
    }
  })
})
