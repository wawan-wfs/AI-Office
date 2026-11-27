// Siklus 522 — ANTI-POISONING permukaan terakhir yang menelan field API
// mentah sebagai React child: baris proyek Dashboard (name/status/preview),
// baris stat container Dashboard & TeamStats (name/cpu/mem — hasil .replace
// pada name non-string melempar TypeError), chip sandbox agent ProjectPanel
// (name). Semuanya kini via normalizeClipText/normalizeSecondary satu sumber
// (lib/clip.js) — konsisten siklus 512-521.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(__dirname, '../..')
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8')

describe('siklus 522 — sweep permukaan terakhir', () => {
  it('Dashboard: baris proyek & stat container dinormalisasi', () => {
    const src = read('src/components/Dashboard.jsx')
    // tidak ada child/interpolasi mentah tersisa di baris proyek & container
    expect(src).not.toMatch(/status \$\{p\.status\}/)
    expect(src).not.toMatch(/Preview: \$\{p\.preview_url\}/)
    expect(src).not.toMatch(/\{p\.status\}\{p\.preview_port/)
    expect(src).not.toMatch(/\{c\.name\.replace\(/)
    expect(src).not.toMatch(/\{c\.cpu\} · \{c\.mem\}/)
    // pemakaian normalizer cukup
    expect(src).toMatch(/normalizeSecondary\(p\.status\)/)
    expect(src).toMatch(/normalizeSecondary\(c\.cpu\)/)
    expect(src).toMatch(/normalizeClipText\(String\(c\.name/)
  })

  it('TeamStats: baris stat container dinormalisasi', () => {
    const src = read('src/components/TeamStats.jsx')
    expect(src).not.toMatch(/\{c\.name\.replace\(/)
    expect(src).not.toMatch(/\{c\.cpu\} · \{c\.mem\}/)
    expect(src).toMatch(/normalizeClipText\(String\(c\.name/)
    expect(src).toMatch(/normalizeSecondary\(c\.cpu\)/)
  })

  it('ProjectPanel: chip sandbox agent dinormalisasi', () => {
    const src = read('src/components/ProjectPanel.jsx')
    expect(src).not.toMatch(/\} \{a\.name\}/)
    expect(src).toMatch(/normalizeClipText\(a\.name\)/)
  })
})
