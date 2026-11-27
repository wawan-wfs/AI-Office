// Siklus 517 — ANTI-POISONING WfsPanel: field chat/agent bentuk sah API
// non-string (d.reply objek, d.error objek, e.message non-string,
// sel.name/role & a.name/a.role numerik) dulu dirender MENTAH →
// "[object Object]" atau crash "Objects are not valid as a React child".
// Kontrak: semua titik render text dibungkus normalizeClipText.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeClipText } from '../lib/clip.js'

const src = readFileSync(new URL('../components/WfsPanel.jsx', import.meta.url), 'utf8')

describe('normalizeClipText kontrak (sumber lib/clip.js)', () => {
  it('null/angka/objek → string aman', () => {
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(42)).toBe('42')
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText(['x'])).toBe('["x"]')
    expect(normalizeClipText('teks')).toBe('teks')
  })
  it('objek siklik → string kosong, bukan throw', () => {
    const o = {}; o.self = o
    expect(normalizeClipText(o)).toBe('')
  })
})

describe('sweep titik render WfsPanel dibungkus normalizeClipText', () => {
  it('header agent (sel.name/sel.role) dibungkus', () => {
    expect(src).toContain('{sel ? normalizeClipText(sel.name) : \'Chat AI Team\'}')
    expect(src).toContain('{sel ? normalizeClipText(sel.role) : \'\'}')
  })
  it('option dropdown agent (a.name/a.role) dibungkus', () => {
    expect(src).toContain('{normalizeClipText(a.name)} — {normalizeClipText(a.role)}')
  })
  it('bubble chat (m.text) dibungkus', () => {
    expect(src).toMatch(/\{\s*normalizeClipText\(m\.text\)\s*\}/)
  })
  it('reply/error API chat dinormalisasi sebelum pushLog', () => {
    expect(src).toContain("normalizeClipText(d.error) || 'Gagal'")
    expect(src).toContain('d.reply != null ? normalizeClipText(d.reply)')
  })
  it('pesan konfigurasi (d.error/e.message) dinormalisasi', () => {
    expect(src).toContain("normalizeClipText(d.error) || 'gagal'")
    expect(src).not.toContain("+ e.message")
    expect(src).toContain("normalizeClipText(e.message)")
  })
  it('tidak ada React child mentah dari field dinamis di JSX WfsPanel', () => {
    const jsx = src.slice(src.indexOf('return ('))
    expect(jsx).not.toMatch(/\{sel\.name\}|\{sel\.role\}|\{m\.text\}|\{a\.name\}|\{a\.role\}/)
  })
})
