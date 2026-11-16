// @vitest-environment jsdom
// Siklus 566: dedup baris log kembar berurutan (pushLog) + key stabil
// ActivityLog. Poll beruntun bisa melaporkan transisi status yang sama dua
// kali (race antar rid) → dialog Log menampilkan baris kembar & badge unread
// menghitung ganda.
import { describe, it, expect } from 'vitest'
import { dedupeLogHead } from '../lib/storage_prefs.js'

const e = (id, status, label = status) => ({ t: '10.00', id, status, label, title: 'x' })

describe('dedupeLogHead (siklus 566)', () => {
  // Kontrak: items[0] adalah ENTRI BARU yang baru di-prepend pushLog;
  // pembanding duplikat = head log lama (items[1]).
  it('duplikat berurutan (entri baru sama dgn log lama) → salinan lama dibuang', () => {
    const log = [e(7, 'done', 'selesai'), e(7, 'done', 'selesai'), e(5, 'running', 'berjalan')]
    const out = dedupeLogHead(log, e(7, 'done', 'selesai'))
    expect(out).toHaveLength(2)
    expect(out[0].id).toBe(7)
    expect(out[1].id).toBe(5)
  })

  it('transisi sah A→B→A TIDAK dibuang (log lama beda transisi)', () => {
    const log = [e(7, 'pending', 'antri'), e(7, 'running', 'berjalan')]
    const out = dedupeLogHead(log, e(7, 'pending', 'antri'))
    expect(out).toHaveLength(2) // entri baru + lama utuh
  })

  it('status sama tapi id berbeda → tidak dibuang', () => {
    const log = [e(8, 'done', 'selesai'), e(9, 'done', 'selesai')]
    expect(dedupeLogHead(log, e(8, 'done', 'selesai'))).toHaveLength(2)
  })

  it('guard: bukan array / entri kosong / log < 2 → apa adanya', () => {
    expect(dedupeLogHead(null, e(1, 'done'))).toBeNull()
    expect(dedupeLogHead([], e(1, 'done'))).toEqual([])
    expect(dedupeLogHead([e(1, 'done')], e(1, 'done'))).toHaveLength(1)
    expect(dedupeLogHead([e(1, 'done')], null)).toHaveLength(1)
  })

  it('label beda (status sama) tidak dianggap duplikat', () => {
    const log = [e(3, 'done', 'selesai'), e(3, 'done', 'selesai-lama')]
    expect(dedupeLogHead(log, e(3, 'done', 'selesai'))).toHaveLength(2)
  })
})
