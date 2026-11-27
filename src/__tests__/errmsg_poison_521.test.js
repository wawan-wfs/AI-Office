// Siklus 521 — ANTI-POISONING string turunan: pesan error (e.message) yang
// masuk state UI (toast, alert konsol, form) harus dinormalisasi via
// normalizeClipText — bentuk sah non-string (objek dari JSON.stringify miss,
// angka) dulu dirender sebagai React child mentah → "Objects are not valid
// as a React child" atau "[object Object]" di toast/alert.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeClipText } from '../lib/clip.js'

const ROOT = resolve(__dirname, '../..')
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8')

describe('kontrak normalizeClipText utk pesan error', () => {
  it('null/undefined → string kosong', () => {
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
  })
  it('objek/array → JSON string (bukan [object Object])', () => {
    expect(normalizeClipText({ code: 500 })).toBe('{"code":500}')
    expect(normalizeClipText(['a', 'b'])).toBe('["a","b"]')
  })
  it('angka/boolean → String', () => {
    expect(normalizeClipText(42)).toBe('42')
    expect(normalizeClipText(true)).toBe('true')
  })
  it('siklik → string kosong, tidak throw', () => {
    const a = {}; a.self = a
    expect(normalizeClipText(a)).toBe('')
  })
})

describe('sweep pemakaian e.message mentah di state UI', () => {
  it('ShConsole: semua setErr/setTermOut membungkus normErr', () => {
    const src = read('src/components/ShConsole.jsx')
    // Tidak ada setErr(e.message) atau 'ERROR: ' + e.message mentah tersisa
    expect(src).not.toMatch(/setErr\(e\.message\)/)
    expect(src).not.toMatch(/'ERROR: ' \+ e\.message/)
    // termOut stderr/stdout dinormalisasi
    expect(src).not.toMatch(/\(d\.stderr \|\| ''\) \+ \(d\.stdout \|\| ''\)/)
    expect(src).toMatch(/normErr\(d\.stderr\)/)
    // import tersedia
    expect(src).toMatch(/normalizeClipText as normErr/)
    // semua pemakaian normErr cukup (>=18 titik catch + 2 termOut)
    const uses = src.match(/normErr\(/g) || []
    expect(uses.length).toBeGreaterThanOrEqual(20)
  })
  it('TaskModal: setErr membungkus normErr', () => {
    const src = read('src/components/TaskModal.jsx')
    expect(src).not.toMatch(/setErr\(e\.message\)/)
    expect(src).toMatch(/setErr\(normErr\(e\.message\)\)/)
  })
  it('TaskBoard: onFlash pesan gagal membungkus normErr', () => {
    const src = read('src/components/TaskBoard.jsx')
    expect(src).not.toMatch(/onFlash\(e\.message/)
    expect(src).not.toMatch(/e\.message \|\| 'server menolak'/)
    expect(src).toMatch(/normErr\(e\.message\)/)
  })
  it('App: flash error konfirmasi membungkus normErr', () => {
    const src = read('src/App.jsx')
    expect(src).not.toMatch(/flash\(e\.message, true\)/)
    expect(src).toMatch(/flash\(normErr\(e\.message\), true\)/)
  })
})
