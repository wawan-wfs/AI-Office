// Siklus 557 — guard sisa interpolasi ID mentah (pasca sweep 553/555).
// Titik terakhir: ActivityLog `#{x.id}` dan Dashboard `aria-label Task ${t.id}`.
// Kontrak: id bentuk sah non-string (objek API) tak boleh dirender mentah.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeClipText } from '../lib/clip.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logSrc = readFileSync(resolve(__dirname, '../components/ActivityLog.jsx'), 'utf8')
const dashSrc = readFileSync(resolve(__dirname, '../components/Dashboard.jsx'), 'utf8')

describe('siklus 557 — sisa id mentah ternormalisasi', () => {
  it('kontrak: id non-string via normalizeClipText', () => {
    expect(normalizeClipText({ sec: 1 })).toBe('{"sec":1}')
    expect(normalizeClipText(42)).toBe('42')
    expect(normalizeClipText(null)).toBe('')
  })

  it('ActivityLog tidak lagi merender #{x.id} mentah', () => {
    expect(logSrc).not.toMatch(/\{\s*'#'\}\s*\{x\.id\}/)
    expect(logSrc).not.toMatch(/#\{x\.id\}/)
    expect(logSrc).toContain("#{normalizeClipText(x.id)}")
  })

  it('Dashboard aria-label task tidak lagi memakai ${t.id} mentah', () => {
    expect(dashSrc).not.toMatch(/Task \$\{t\.id\}/)
    expect(dashSrc).toMatch(/Task \$\{normalizeClipText\(t\.id\)\}/)
  })
})
