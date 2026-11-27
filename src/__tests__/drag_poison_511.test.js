/**
 * drag_poison_511.test.js — Guard siklus 511: anti-poisoning payload drag Kanban.
 * setupCardDragData dengan field non-string (bentuk sah API: title numerik,
 * status/priority null) tidak boleh menghasilkan "[object Object]" di payload
 * application/json — semua field teks dinormalisasi via normalizeClipText.
 */
import { describe, it, expect } from 'vitest'
import { setupCardDragData } from '../lib/kanban_drag'

function mockDt() {
  const store = {}
  return {
    store,
    setData: (k, v) => { store[k] = v },
    effectAllowed: 'none',
  }
}

describe('setupCardDragData anti-poisoning (511)', () => {
  it('title numerik → string angka, bukan [object Object]', () => {
    const dt = mockDt()
    expect(setupCardDragData(dt, { id: 1, title: 12345 })).toBe(true)
    const payload = JSON.parse(dt.store['application/json'])
    expect(payload.title).toBe('12345')
    expect(payload.title).not.toContain('object')
  })

  it('title objek → serialisasi JSON, bukan [object Object]', () => {
    const dt = mockDt()
    setupCardDragData(dt, { id: 2, title: { en: 'Fix', id: 'Perbaikan' } })
    const payload = JSON.parse(dt.store['application/json'])
    expect(payload.title).toBe('{"en":"Fix","id":"Perbaikan"}')
    expect(payload.title).not.toBe('[object Object]')
  })

  it('title null/undefined → string kosong', () => {
    const dtA = mockDt()
    const dtB = mockDt()
    setupCardDragData(dtA, { id: 3, title: null })
    setupCardDragData(dtB, { id: 4 })
    expect(JSON.parse(dtA.store['application/json']).title).toBe('')
    expect(JSON.parse(dtB.store['application/json']).title).toBe('')
  })

  it('status/priority null → default pending/normal sebagai string', () => {
    const dt = mockDt()
    setupCardDragData(dt, { id: 5, status: null, priority: null })
    const payload = JSON.parse(dt.store['application/json'])
    expect(payload.status).toBe('pending')
    expect(payload.priority).toBe('normal')
  })

  it('status numerik → string, tidak crash', () => {
    const dt = mockDt()
    setupCardDragData(dt, { id: 6, status: 2, priority: 1 })
    const payload = JSON.parse(dt.store['application/json'])
    expect(payload.status).toBe('2')
    expect(payload.priority).toBe('1')
  })

  it('kontrak lama utuh: task string normal & kontrak fallback', () => {
    const dt = mockDt()
    expect(setupCardDragData(dt, { id: 42, title: 'Optimasi WebGL', status: 'in_progress', priority: 'high' })).toBe(true)
    expect(JSON.parse(dt.store['application/json'])).toEqual({
      id: 42, title: 'Optimasi WebGL', status: 'in_progress', priority: 'high',
    })
    expect(setupCardDragData(null, { id: 1 })).toBe(false)
    expect(setupCardDragData({}, null)).toBe(false)
    expect(setupCardDragData({}, {})).toBe(false)
  })
})
