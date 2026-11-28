// Siklus 566: guard ID mentah ShConsole — t.id & a.project_id dijalankan
// MENTAH sebagai React child (pasca 565). ID bentuk sah non-string dari API
// → '[object Object]' tampil di baris task & approval. Paritas siklus 557
// (ActivityLog #{x.id} & Dashboard aria-label Task ${t.id}).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const src = readFileSync(join(process.cwd(), 'src/components/ShConsole.jsx'), 'utf8')

describe('siklus 566 — normalisasi ID baris task & approval ShConsole', () => {
  it('sumber: t.id & a.project_id dibungkus normalizer', () => {
    expect(src).toMatch(/#\{normalizeClipText\(t\.id\)\}/)
    expect(src).toMatch(/#\{normalizeSecondary\(a\.project_id\) \|\| '-'\}/)
  })

  it('anti-regresi: tak ada interpolasi ID mentah di baris render', () => {
    expect(src).not.toMatch(/>\s*#\{t\.id\}/)
    expect(src).not.toMatch(/#\{a\.project_id \|\| '-'\}/)
  })
})
