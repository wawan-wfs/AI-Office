// Guard siklus 546 — anti-poisoning strip papan proyek (nama agen & tenant).
// Nama bentuk sah non-string (objek/array dari API) tak boleh menghasilkan
// '[object Object]' di strip bawah papan 3D; nama kosong → segmen dilewati.
import { describe, it, expect } from 'vitest'
import { stripSegments, clampStripTenant } from '../scene/parts/projectboard_data.js'

const BAD = [{ toxic: true }, ['x'], null, undefined]

describe('clampStripTenant anti-poisoning (siklus 546)', () => {
  it('objek/array/null → "" (bukan [object Object])', () => {
    for (const b of BAD) expect(clampStripTenant(b)).toBe('')
    expect(clampStripTenant('sandbox tenant panjang sekali ya')).toContain('…')
  })
})

describe('stripSegments nama agen (siklus 546)', () => {
  it('nama agen objek → tanpa [object Object]; nama sah utuh', () => {
    const snap = { saas: { online: false }, agents: [{ name: { o: 1 }, status: 'Up' }, { name: 'sbx-budi', status: 'Up' }] }
    const txt = stripSegments(snap).map(s => s.txt).join(' | ')
    expect(txt).not.toContain('object')
    expect(txt).toContain('sbx-budi')
    // agen tanpa nama valid → segmen dilewati, hitungan '+N lagi' tetap benar
    const snap2 = { saas: { online: false }, agents: [{ name: ['x'], status: 'Up' }, { name: 'sbx-a', status: 'Up' }, { name: 'sbx-b', status: 'Up' }, { name: 'sbx-c', status: 'Up' }] }
    const t2 = stripSegments(snap2).map(s => s.txt).join(' | ')
    expect(t2).not.toContain('object')
    expect(t2).toContain('1 lagi')
  })
})
