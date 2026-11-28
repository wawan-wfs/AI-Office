import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../components/TaskBoard.jsx', import.meta.url), 'utf8')

describe('detail panel ID poisoning guard 574', () => {
  it('detail panel title tidak lagi memakai interpolasi #{sel.id} mentah', () => {
    expect(src).not.toMatch(/\{#\{sel\.id\}\}/)
    expect(src).toMatch(/#\{normalizeClipText\(sel\.id\)\}/)
  })

  it('normalizer null-safe: objek → JSON, null → [?]', async () => {
    const mod = await import('../lib/clip.js')
    const n = mod.normalizeClipText
    expect(n({ a: 1 })).toBe('{"a":1}')
    expect(n(null)).toBe('')
    expect(n('T-42')).toBe('T-42')
    expect(n(42)).toBe('42')
  })
})
