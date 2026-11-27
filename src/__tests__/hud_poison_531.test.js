import { describe, it, expect } from 'vitest'
import { normalizeClipText } from '../lib/clip'
import { readFileSync } from 'fs'
import { join } from 'path'

// Siklus 531: guard anti-poisoning HUD — chip/label dari API tidak boleh
// dirender mentah (objek bentuk sah → "[object Object]").

describe('normalizeClipText kontrak', () => {
  it('objek → string aman, string tetap', () => {
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText('ok')).toBe('ok')
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
    expect(normalizeClipText(42)).toBe('42')
  })
})

describe('HUD.jsx tanpa interpolasi label mentah', () => {
  const src = readFileSync(join(__dirname, '..', 'components', 'HUD.jsx'), 'utf8')
  it('mengimpor normalizeClipText', () => {
    expect(src).toMatch(/import \{[^}]*normalizeClipText[^}]*\} from '\.\.\/lib\/clip'/)
  })
  it('tidak ada child/atribut detail/label/status/phase mentah', () => {
    const bad = [
      /title=\{conn\.detail\}/,
      /aria-label=\{`[^`]*\$\{conn\.detail\}[^`]*`\}(?![\s\S]{0,40}normalizeClipText)/,
      /<i aria-hidden="true" \/>\{conn\.label\}/,
      /<i aria-hidden="true" \/>\{perf\.label\}/,
      /<i \/>\{status\}/,
    ]
    for (const re of bad) expect(src).not.toMatch(re)
    expect(src.match(/normalizeClipText\(/g).length).toBeGreaterThanOrEqual(7)
  })
})
