import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TASK_STATUS_COLORS } from '../lib/task_status_colors.js'
import { PB_FOOT, PB_COL_BG, PB_CARD, PB_FRAME, PB_PENDING, PB_BG, NOTE_TEXT } from '../lib/ui_palette.js'

const src = readFileSync(join(process.cwd(), 'src/scene/parts/projectboard.js'), 'utf8')

describe('siklus 416 — palet kanvas papan proyek satu sumber', () => {
  it('nilai historis terkunci', () => {
    expect(PB_BG).toBe('#10192b')
    expect(PB_FRAME).toBe('#2c3e5c')
    expect(PB_COL_BG).toBe('#17233a')
    expect(PB_CARD).toBe('#0d1524')
    expect(PB_FOOT).toBe('#0b1424')
    expect(NOTE_TEXT).toBe('#cfd8e3')
    expect(PB_PENDING).toBe('#9aa7b8')
    expect(PB_PENDING.toLowerCase()).toBe(TASK_STATUS_COLORS.pending.toLowerCase())
  })
  it('painter delegasi penuh — 0 literal warna tersisa', () => {
    const lits = ['#10192b', '#2c3e5c', '#17233a', '#0d1524', '#0b1424', '#cfd8e3', '#9aa7b8', '#ffffff', '#fff',
      'rgba(255,255,255', 'rgba(239,68,68']
    for (const lit of lits) expect(src.includes(lit), `literal ${lit} masih ada`).toBe(false)
    for (const c of ['PB_BG', 'PB_FRAME', 'PB_COL_BG', 'PB_CARD', 'PB_FOOT', 'NOTE_TEXT as PB_TXT_SOFT', 'PB_PENDING',
      'whiteAlpha(', 'failedAlpha(', 'PURE_TEXT']) {
      expect(src.includes(c), `delegasi ${c} hilang`).toBe(true)
    }
  })
  it('helper anti-poisoning', () => {
    // via modul: whiteAlpha/failedAlpha diekspor — verifikasi perilaku null
    import('../lib/ui_palette.js').then(m => {
      expect(m.whiteAlpha(2)).toBeNull()
      expect(m.failedAlpha(-1)).toBeNull()
    })
  })
})
