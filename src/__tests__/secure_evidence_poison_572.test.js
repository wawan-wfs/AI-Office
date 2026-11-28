import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Guard siklus 572: manifest QA evidence.files — path/sha256 objek bentuk sah
// API → '[object Object]' di UI + duplicate key React. Render kini ternormalisasi
// via normalizeSecondary dengan key fallback, files non-array diabaikan.
const src = readFileSync(join(__dirname, '..', 'components', 'SecureProjectPanel.jsx'), 'utf8')

describe('secure evidence files poison 572', () => {
  it('tidak ada render mentah f.path/f.sha256 sebagai key/child', () => {
    expect(src).not.toMatch(/key=\{f\.path\}/)
    expect(src).not.toMatch(/\{f\.path\}[\s\S]{0,40}\{f\.sha256\}/)
  })

  it('path & sha256 ternormalisasi normalizeSecondary + guard Array.isArray', () => {
    expect(src).toMatch(/Array\.isArray\(evidence\.files\)/)
    expect(src).toMatch(/normalizeSecondary\(f && f\.path\)/)
    expect(src).toMatch(/normalizeSecondary\(f && f\.sha256\)/)
    expect(src).toMatch(/key=\{fpath \|\| fsha \|\| 'file'\}/)
  })
})
