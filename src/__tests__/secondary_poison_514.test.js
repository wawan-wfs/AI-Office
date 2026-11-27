import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Siklus 514 — titik render agent_id tersisa di TaskBoard (kartu kanban + tombol
// fokus detail) harus dibungkus normalizeSecondary: field numerik/objek (bentuk
// sah API) tidak boleh jadi React child mentah ("Objects are not valid as a
// React child") maupun tampil "[object Object]".

const tb = readFileSync(resolve(__dirname, '../components/TaskBoard.jsx'), 'utf8')

describe('secondary_poison_514 — agent_id tersisa TaskBoard dinormalisasi', () => {
  it('semua titik render agent_id sebagai React child dibungkus normalizeSecondary', () => {
    const raw = tb.match(/\{(?:sel|t)\.agent_id\}/g) || []
    const bad = raw.filter((m) => {
      const line = tb.split('\n').find((l) => l.includes(m)) || ''
      // hanya template literal (title/aria-label/body) yang sah memakai raw;
      // React child murni ({...} sendirian di JSX) harus dinormalisasi
      return !line.includes('`')
    })
    expect(bad, `React child mentah tersisa: ${bad.join(', ')}`).toEqual([])
    expect(tb).toContain('{normalizeSecondary(sel.agent_id)}')
    expect(tb).toContain('{normalizeSecondary(t.agent_id)}')
  })

  it('kontrak normalizeSecondary: null → "", angka → String, objek → JSON', () => {
    const m = tb.match(/const normalizeSecondary = \(v\) =>[^\n]+/)
    expect(m).toBeTruthy()
    const fn = eval('(' + m[0].replace('const normalizeSecondary = ', '') + ')')
    expect(fn(null)).toBe('')
    expect(fn(undefined)).toBe('')
    expect(fn('')).toBe('')
    expect(fn('agn-01')).toBe('agn-01')
    expect(fn(7)).toBe('7')
    expect(fn(true)).toBe('true')
    expect(fn({ a: 1 })).toBe('{"a":1}')
    expect(fn([1, 2])).toBe('[1,2]')
    const cyc = {}; cyc.self = cyc
    expect(fn(cyc)).toBe('')
  })

  it('komponen sekunder lain tetap membungkus render sekunder', () => {
    for (const f of ['TeamStats.jsx', 'Dashboard.jsx', 'ShConsole.jsx']) {
      const s = readFileSync(resolve(__dirname, '../components', f), 'utf8')
      expect(s.match(/\{(?:sel|t)\.(?:agent_id|status|role)\}/g) || []).toEqual([])
    }
  })
})
