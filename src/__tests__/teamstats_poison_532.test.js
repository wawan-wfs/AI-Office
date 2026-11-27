import { describe, it, expect } from 'vitest'
import { normalizeClipText } from '../lib/clip'
import { readFileSync } from 'fs'
import { join } from 'path'

// Siklus 532: guard anti-poisoning TeamStats — nama divisi, lantai, lead,
// awayLabel, id task dari API tidak boleh dirender mentah
// (objek bentuk sah → "[object Object]" / label screen reader rusak).

describe('normalizeClipText kontrak', () => {
  it('objek → string aman, string tetap', () => {
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText('ok')).toBe('ok')
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
    expect(normalizeClipText(42)).toBe('42')
  })
})

describe('TeamStats.jsx tanpa interpolasi label mentah', () => {
  const src = readFileSync(join(__dirname, '..', 'components', 'TeamStats.jsx'), 'utf8')
  it('mengimpor normalizeClipText', () => {
    expect(src).toMatch(/import \{[^}]*normalizeClipText[^}]*\} from '\.\.\/lib\/clip/)
  })
  it('tidak ada interpolasi mentah team.name/floor/lead/t.id/awayLabel/byStatus', () => {
    const bad = [
      /aria-label=\{`\$\{team\.name\}/,
      /title=\{`[^`]*\$\{team\.name\}[^`]*`\}(?![\s\S]{0,60}normalizeClipText)/,
      /title=\{`[^`]*\(Lantai \$\{team\.floor\}\)/,
      /Lt\. \$\{team\.floor\}/,
      /divisi \$\{team\.name\}(?![\s\S]{0,30}normalizeClipText)/,
      /pod \$\{team\.name\}(?![\s\S]{0,30}normalizeClipText)/,
      /Lead: \$\{team\.lead\}/,
      /<span>\{team\.name\}<\/span>/,
      /\$\{pr\.awayLabel\}(?![\s\S]{0,40}normalizeClipText)/,
      /\{pr\.awayLabel\}/,
      /#\$\{t\.id\}(?![\s\S]{0,40}normalizeClipText)/,
      /\$\{byStatus\[s\] \|\| 0\} task/,
      /\$\{l\.toLowerCase\(\)\}/,
    ]
    const hits = bad.filter(r => r.test(src))
    expect(hits.map(r => String(r))).toEqual([])
  })
})
