// Siklus 555 — GUARD ANTI-POISONING jalur dialog konfirmasi (ConfirmModal):
// title/text/confirmLabel mengalir dari banyak sumber dinamis (App ask, TaskBoard
// ask, ActivityLog onAsk, ShConsole bulkConfirm). Field bentuk sah non-string
// (t.id angka, t.agent_id objek/array, ask.ok non-string) dulu dirender MENTAH →
// '[object Object]' di dialog modal aksesibel. Kontrak:
//  - TaskBoard.ask: title aman utk id non-string; body TIDAK boleh interpolasi
//    t.title / t.agent_id mentah (via normalizeClipText).
//  - ConfirmModal: merender title/text/confirmLabel apa pun bentuknya tanpa
//    crash atau '[object Object]' (objek → JSON, angka → String).
//  - ActivityLog onAsk: body statis aman; ok string.
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { normalizeClipText } from '../lib/clip.js'
import { readFileSync } from 'node:fs'

describe('siklus 555: kontrak TaskBoard.ask (dialog konfirmasi)', () => {
  it('title aman utk id non-string via template id String()', () => {
    const src = readFileSync(new URL('../components/TaskBoard.jsx', import.meta.url), 'utf8')
    expect(src).toMatch(/const ask = \(t\) => onAsk\(\{ title: `Jalankan task #\$\{String\(t\.id\)\}\?`/)
    expect(src).not.toMatch(/title: `Jalankan task #\$\{t\.id\}\?`/)
  })
  it('body tanpa interpolasi t.title / t.agent_id mentah', () => {
    const src = readFileSync(new URL('../components/TaskBoard.jsx', import.meta.url), 'utf8')
    expect(src).toMatch(/normalizeClipText\(t\.title\)/)
    expect(src).toMatch(/\$\{String\(t\.agent_id\)\}/)
    expect(src).not.toMatch(/memanggil model AI[^\n]*\$\{t\.title\}/)
    expect(src).not.toMatch(/oleh \$\{t\.agent_id\}/)
  })
})

describe('siklus 555: ConfirmModal anti-poisoning render', () => {
  const cases = [
    { title: 'Jalankan task #12?', text: 'ok' },
    { title: 12, text: { code: 'ERR', details: ['a', 1] } },
    { title: { label: 'Konfirmasi' }, text: null, confirmLabel: { raw: 1 } },
  ]
  cases.forEach((props, i) => {
    it(`bentuk ${i} tanpa crash & tanpa '[object Object]'`, () => {
      const html = renderToStaticMarkup(React.createElement(ConfirmModal, { show: true, ...props, onConfirm: () => {}, onCancel: () => {} }))
      expect(html).not.toContain('[object Object]')
      expect(html).toContain('Batal')
    })
  })
})

describe('siklus 555: ActivityLog onAsk body statis & App text ternormalisasi', () => {
  it('ActivityLog body/konstanta; App pendingCount via String()', () => {
    const log = readFileSync(new URL('../components/ActivityLog.jsx', import.meta.url), 'utf8')
    expect(log).toMatch(/body: 'Seluruh riwayat perubahan status task dihapus/)
    expect(log).toMatch(/ok: 'Ya, bersihkan'/)
    const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
    expect(app).toMatch(/\$\{String\(pendingCount\)\} task/)
    expect(app).not.toMatch(/\$\{pendingCount\} task/)
  })
  it('normalizeClipText kontrak dasar (regresi)', () => {
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText(5)).toBe('5')
    expect(normalizeClipText(null)).toBe('')
  })
})
