// Guard siklus 560 — residu anti-poisoning renderer layar 3D (pasca 542-544):
// 1) formatTaskId menerima id objek/array bentuk sah API tanpa '[object Object]'
// 2) TV lounge baris progres 'pct% · done/total task' tanpa '[object Object]'
// 3) anti-regresi: pola interpolasi mentah tak boleh kembali.
import { describe, it, expect } from 'vitest'
import { formatTaskId } from '../scene/parts/projectboard_data.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('siklus 560 — formatTaskId anti-poisoning', () => {
  it('id objek → segmen JSON, bukan [object Object]', () => {
    expect(formatTaskId({ sec: 1, n: 2 })).not.toContain('[object Object]')
    expect(formatTaskId({ sec: 1 })).toContain('sec')
  })
  it('id array → JSON, bukan [object Object]', () => {
    expect(formatTaskId(['a', 'b'])).not.toContain('[object Object]')
  })
  it('id biasa tetap utuh', () => {
    expect(formatTaskId('task-9da32873')).toBe('#9da32873')
    expect(formatTaskId(21)).toBe('#21')
    expect(formatTaskId(null)).toBe('')
    expect(formatTaskId('')).toBe('')
  })
})

describe('siklus 560 — TV lounge progres anti-poisoning', () => {
  const src = readFileSync(resolve(__dirname, '../scene/parts/tv_canvas.js'), 'utf8')
  it('baris progres tidak lagi menggabungkan T.done/T.total mentah', () => {
    expect(src).not.toMatch(/\+\s*T\.done\s*\+\s*'\//)
    expect(src).not.toMatch(/T\.total\s*\+\s*' task'/)
  })
  it('koersi cnt() dengan fallback safeText ada', () => {
    expect(src).toMatch(/const cnt = v =>/)
    expect(src).toMatch(/cnt\(T\.done\).*cnt\(T\.total\)/)
  })
})
