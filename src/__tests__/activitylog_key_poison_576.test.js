import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeClipText } from '../lib/clip.js'

const src = readFileSync(new URL('../../components/ActivityLog.jsx'.replace('../../', '../'), import.meta.url), 'utf8')

describe('ActivityLog React key anti-poisoning (576)', () => {
  it('tidak ada key dari x.id mentah tanpa normalisasi', () => {
    expect(src).not.toMatch(/key=\{\s*`t-\$\{x\.id\}/)
    expect(src).not.toMatch(/key=\{x\?*\.id/)
    expect(src).toContain('key={`t-${normalizeClipText(x.id)}`}')
  })
  it('normalizeClipText: objek → JSON, null → ""', () => {
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText('abc')).toBe('abc')
    expect(normalizeClipText(42)).toBe('42')
  })
})
