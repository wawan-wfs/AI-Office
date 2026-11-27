// Siklus 516 — ANTI-POISONING pipeline log aktivitas: label/status/title
// non-string (bentuk sah API) harus dinormalisasi di 3 titik:
//   1) App.pushLog — label dibungkus normalizeClipText
//   2) formatLogText/formatLogFileText (storage_prefs) — Salin/unduh .txt
//   3) ActivityLog render — {x.label} dibungkus normalizeClipText
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { formatLogText, formatLogFileText, dedupeLogHead } from '../lib/storage_prefs.js'
import { normalizeClipText } from '../lib/clip.js'

const R = (p) => readFileSync(resolve(__dirname, p), 'utf8')

describe('kontrak normalizeClipText (sumber tunggal, siklus 508)', () => {
  it('null/angka/objek/siklik aman', () => {
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(7)).toBe('7')
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    const cyc = {}; cyc.self = cyc
    expect(normalizeClipText(cyc)).toBe('')
  })
})

describe('formatLogText — Salin/unduh log bebas [object Object]', () => {
  it('label objek & title objek dinormalisasi', () => {
    const items = [{ t: 0, id: 3, status: 5, label: { k: 'v' }, title: { n: 1 } }]
    const out = formatLogText(items)
    expect(out).toContain('{"k":"v"}')
    expect(out).toContain('{"n":1}')
    expect(out).not.toContain('[object Object]')
  })
  it('status numerik tidak crash, string utuh', () => {
    const items = [{ t: 0, id: 1, status: 5, label: 'berjalan', title: 'x' }]
    expect(formatLogText(items)).toContain('berjalan')
  })
  it('formatLogFileText header + body normal', () => {
    const out = formatLogFileText([{ t: 0, id: 2, status: 1, label: { z: 0 }, title: null }], new Date(2026, 0, 1))
    expect(out).toContain('{"z":0}')
    expect(out).not.toContain('[object Object]')
  })
})

describe('dedupeLogHead kontrak lama utuh', () => {
  it('head kembar dibuang', () => {
    const e = { id: 1, status: 'done', label: 'selesai' }
    const items = [e, { ...e }, { id: 2, status: 'pending', label: 'antri' }]
    expect(dedupeLogHead(items, e).length).toBe(2)
  })
})

describe('sweep titik render/push dibungkus normalisasi', () => {
  it('App.pushLog membungkus label dgn normalisasi', () => {
    const app = R('../App.jsx')
    expect(app).toMatch(/label:\s*normText\(L\[x\.status\]\s*\|\|\s*x\.status\)/)
    expect(app).toMatch(/normalizeClipText as normText/)
  })
  it('ActivityLog membungkus x.label, tidak ada child mentah', () => {
    const c = R('../components/ActivityLog.jsx')
    expect(c).toContain('normalizeClipText(x.label)')
    expect(c).not.toMatch(/\{x\.label\}/)
  })
  it('formatLogText (storage_prefs) memakai normalizeClipText', () => {
    const lib = R('../lib/storage_prefs.js')
    expect(lib).toMatch(/normalizeClipText\(x && x\.label\)/)
    expect(lib).toMatch(/normalizeClipText\(x && x\.title\)/)
  })
})
