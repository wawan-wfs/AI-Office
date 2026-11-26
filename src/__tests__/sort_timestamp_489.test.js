// Siklus 489 — sortir task papan satu sumber timestamp (extractTaskSortValue).
//
// Bug nyata: extractTaskSortValue (kanban_spec) HANYA membaca created_at
// numerik. Task tanpa created_at tetapi dengan updated_at REAL (bentuk data
// sah dari API /tasks) dulu jatuh ke fallback numeric-ID → sortBy
// newest/oldest salah urutan (ID kecil dibuat belakangan tampil paling bawah
// "terbaru"). created_at berbentuk string ISO juga diabaikan dulu.
// Fix: delegasi penuh ke parseTaskTimestamp (kanban_date, parser satu sumber
// dipakai juga filter rentang tanggal 270) — menangkap created_at ?? updated_at
// ?? …, diskalakan detik-UNIX → ms, parsing string.
import { describe, it, expect } from 'vitest'
import { sortTasks, extractTaskSortValue } from '../scene/parts/kanban_spec.js'

const SPEC = 'src/scene/parts/kanban_spec.js'
const specSrc = await import('node:fs').then(fs => fs.readFileSync(SPEC, 'utf8'))

describe('sort_timestamp_489 — extractTaskSortValue satu sumber parseTaskTimestamp', () => {
  it('task tanpa created_at tetapi punya updated_at REAL diurutkan benar (dulu fallback ID salah)', () => {
    // ID kecil = dibuat/diperbarui BELAKANGAN (updated_at lebih besar)
    const tasks = [
      { id: 1, updated_at: 100 },
      { id: 999, updated_at: 900 },
      { id: 50, updated_at: 500 },
    ]
    expect(sortTasks(tasks, 'newest').map(t => t.id)).toEqual([999, 50, 1])
    expect(sortTasks(tasks, 'oldest').map(t => t.id)).toEqual([1, 50, 999])
  })

  it('detik-UNIX REAL diskalakan ms & ISO string diparsing (paritas parser 270)', () => {
    // 1_700_000_000 detik < 1e10 → ×1000 ms oleh parseTimestampMs
    expect(extractTaskSortValue({ id: 5, created_at: 1700000000 })).toBe(1700000000000)
    expect(extractTaskSortValue({ id: 6, created_at: '2026-11-26T00:00:00Z' }))
      .toBe(Date.parse('2026-11-26T00:00:00Z'))
    // updated_at detik-UNIX juga terbaca (dulu diabaikan penuh)
    expect(extractTaskSortValue({ id: 7, updated_at: 1700000001 })).toBe(1700000001000)
  })

  it('fallback ID dipertahankan untuk task tanpa timestamp apa pun (kontrak lama)', () => {
    expect(extractTaskSortValue({ id: 55 })).toBe(55)
    expect(extractTaskSortValue({ id: 'task-123' })).toBe(123)
    expect(extractTaskSortValue({ id: 'custom-task' })).toBe('custom-task')
    expect(extractTaskSortValue(null)).toBe(0)
    // kontrak tes lama 473: created_at numerik masih menang atas ID
    expect(extractTaskSortValue({ id: 99, created_at: 1700 })).toBe(1700000)
  })

  it('anti-regresi: delegasi ke parseTaskTimestamp, pembacaan langsung created_at numerik dihapus', () => {
    expect(specSrc).toContain('parseTaskTimestamp(task)')
    expect(specSrc).toContain("parseTaskTimestamp } from '../../lib/kanban_date.js'")
    // pembacaan dangkal lama tidak boleh kembali
    expect(specSrc).not.toContain("task.created_at != null && !isNaN(Number(task.created_at))")
  })
})
