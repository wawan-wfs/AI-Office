// Siklus 518 — Guard anti-poisoning SecureProjectPanel + Ticker:
// field sekunder (tests_passed, job.role/status/id, s.count/label,
// conn.label/detail) harus dibungkus normalizer, bukan React child mentah.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (p) => readFileSync(resolve(__dirname, '../..', p), 'utf8')

describe('secondary_poison_518 — SecureProjectPanel & Ticker', () => {
  const spp = read('src/components/SecureProjectPanel.jsx')
  const ticker = read('src/components/Ticker.jsx')

  it('SecureProjectPanel punya helper normalizeSecondary dgn kontrak normalisasi', () => {
    expect(spp).toMatch(/function normalizeSecondary\(/)
    expect(spp).toMatch(/JSON\.stringify/)
    expect(spp).toMatch(/Number\.isFinite/)
  })

  it('tidak ada field sekunder mentah di SecureProjectPanel JSX', () => {
    expect(spp).not.toMatch(/\{evidence\.tests_passed\}/)
    expect(spp).not.toMatch(/\{job\.role\}/)
    expect(spp).not.toMatch(/\{job\.status\}/)
    expect(spp).not.toMatch(/<small>\{job\.id\}<\/small>/)
    expect(spp).not.toMatch(/<b>\{job\.role\}<\/b>/)
    expect(spp).toMatch(/normalizeSecondary\(job\.role\)/)
    expect(spp).toMatch(/normalizeSecondary\(job\.status\)/)
    expect(spp).toMatch(/normalizeSecondary\(job\.id\)/)
  })

  it('normalizeSecondary menormalkan null/angka/objek/siklik', async () => {
    // helper lokal dievaluasi via ekstraksi regex agar kontrak terkunci
    const src = spp.match(/function normalizeSecondary\(v\) \{[\s\S]*?\n\}/)[0]
    const fn = new Function(`return (${src.replace('function normalizeSecondary(v)', 'function (v)')})`)()
    expect(fn(null)).toBe('')
    expect(fn('')).toBe('')
    expect(fn('ok')).toBe('ok')
    expect(fn(42)).toBe('42')
    expect(fn(false)).toBe('false')
    expect(fn(NaN)).toBe('')
    expect(fn({ a: 1 })).toBe('{"a":1}')
    const cyc = {}; cyc.self = cyc
    expect(fn(cyc)).toBe('')
  })

  it('Ticker field presence/conn dibungkus normalizeClipText', () => {
    expect(ticker).not.toMatch(/\{s\.count\} \{s\.label\}/)
    expect(ticker).not.toMatch(/<span>\{conn\.label\}<\/span>/)
    expect(ticker).not.toMatch(/title=\{conn\.detail\}/)
    expect(ticker).toMatch(/normalizeClipText\(s\.count\)/)
    expect(ticker).toMatch(/normalizeClipText\(s\.label\)/)
    expect(ticker).toMatch(/normalizeClipText\(conn\.label\)/)
    expect(ticker).toMatch(/normalizeClipText\(conn\.detail\)/)
  })
})
