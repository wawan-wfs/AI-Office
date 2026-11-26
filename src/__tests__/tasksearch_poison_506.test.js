// Siklus 506 — anti-poisoning matchTaskSearch: field task non-string dulu
// memicu TypeError di .toLowerCase() (task lama / bentuk sah API dengan title
// numerik / objek). Kini semua field teks dipaksa String() — pencarian board
// tak pernah crash, hanya tidak cocok. Kontrak pencarian lama utuh.
import { describe, it, expect } from 'vitest'
import { matchTaskSearch, filterTasks } from '../scene/parts/kanban_spec.js'

describe('matchTaskSearch non-string field poisoning (506)', () => {
  it('title numerik tidak melempar TypeError dan tetap tercari sebagai teks', () => {
    const t = { id: 7, title: 12345, status: 'pending' }
    expect(() => matchTaskSearch(t, '123')).not.toThrow()
    expect(matchTaskSearch(t, '123')).toBe(true)
    expect(matchTaskSearch(t, 'zzz')).toBe(false)
  })

  it('field desc/priority objek & null tidak crash', () => {
    const t = { id: 'x', title: 'ok', desc: { bad: true }, priority: null, status: undefined }
    expect(() => matchTaskSearch(t, 'ok')).not.toThrow()
    expect(matchTaskSearch(t, 'ok')).toBe(true)
  })

  it('task non-object tetap false (kontrak lama)', () => {
    expect(matchTaskSearch(null, 'a')).toBe(false)
    expect(matchTaskSearch(undefined, 'a')).toBe(false)
    expect(matchTaskSearch('str', 'a')).toBe(false)
  })

  it('filterTasks papan penuh lolos dengan task bentuk campuran', () => {
    const tasks = [
      { id: 1, title: 'Rapor keuangan', status: 'pending', desc: null },
      { id: 2, title: 987, status: 'done' },
      null,
    ]
    expect(filterTasks(tasks, { q: '987' })).toHaveLength(1)
    expect(() => filterTasks(tasks, { q: 'rapor' })).not.toThrow()
    expect(filterTasks(tasks, { q: 'rapor' })).toHaveLength(1)
  })

  it('kontrak lama: pencarian teks/tag normal tetap berfungsi', () => {
    const t = { id: 3, title: 'Fix #api gateway', status: 'running' }
    expect(matchTaskSearch(t, '#api')).toBe(true)
    expect(matchTaskSearch(t, 'gateway running')).toBe(true)
    expect(matchTaskSearch(t, 'tidakada')).toBe(false)
  })
})
