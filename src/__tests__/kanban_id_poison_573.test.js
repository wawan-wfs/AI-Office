import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { normalizeClipText } from '../lib/clip'

const src = readFileSync(join(__dirname, '..', 'components', 'TaskBoard.jsx'), 'utf8')

describe('siklus 573: guard ID mentah kartu kanban TaskBoard', () => {
  it('objek bentuk sah -> JSON, bukan [object Object]', () => {
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
    expect(normalizeClipText(12)).toBe('12')
  })
  it('anti-regresi: render ID kartu kanban pakai normalizer', () => {
    expect(src).not.toMatch(/kanban-card-id">#\{t\.id\}/)
    expect(src).not.toMatch(/aria-label=\{`Task #\$\{t\.id\}/)
    expect(src).toMatch(/kanban-card-id">#\{normalizeClipText\(t\.id\)\}/)
  })
})
