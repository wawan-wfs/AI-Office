// Siklus 417 — palet plafon satu sumber:
// 1) ceiling_canvas.js: vignette AO, seam & bevel diekspor (CEIL_VIGNETTE_IN/
//    OUT, CEIL_SEAM, CEIL_BEVEL) — painter delegasi, 0 literal tersisa.
// 2) room.js createCeilingFixtures: pasangan day/night panel+bohlam kini dari
//    ceiling_fixtures_palette.js (CEIL_PANEL_DAY/NIGHT, PEND_BULB_DAY/NIGHT).
// Nilai identik kode lama (169/312) — tampilan tak berubah.
import { describe, it, expect } from 'vitest'
import {
  drawCeiling, CEIL_SIZE, CEIL_TILES, CEIL_CELL, CEIL_TOP, CEIL_BOTTOM,
  CEIL_VIGNETTE_IN, CEIL_VIGNETTE_OUT, CEIL_SEAM, CEIL_BEVEL,
} from '../scene/parts/ceiling_canvas.js'
import {
  CEIL_PANEL_DAY, CEIL_PANEL_NIGHT, PEND_BULB_DAY, PEND_BULB_NIGHT,
} from '../scene/parts/ceiling_fixtures_palette.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('ceiling palette 417 — painter kanvas satu sumber', () => {
  it('nilai historis terkunci (identik literal lama siklus 312)', () => {
    expect(CEIL_VIGNETTE_IN).toBe('rgba(20,36,64,0.35)')
    expect(CEIL_VIGNETTE_OUT).toBe('rgba(4,9,18,0.55)')
    expect(CEIL_SEAM).toBe('rgba(70,95,140,0.35)')
    expect(CEIL_BEVEL).toBe('rgba(120,150,200,0.12)')
  })
  it('painter delegasi: 0 literal warna tersisa di ceiling_canvas.js', () => {
    const src = readFileSync(resolve(__dirname, '../scene/parts/ceiling_canvas.js'), 'utf8')
    const body = src.split('export {')[0]
    const literals = (body.match(/'(rgba\(|#[0-9a-fA-F]{6})[^']*'/g) || []).filter(
      (s) => !Object.values({ CEIL_TOP, CEIL_BOTTOM, CEIL_VIGNETTE_IN, CEIL_VIGNETTE_OUT, CEIL_SEAM, CEIL_BEVEL }).some((c) => s.includes(c)),
    )
    expect(literals).toEqual([])
  })
  it('palet fixtures: nilai historis terkunci + delegasi room.js', () => {
    expect(CEIL_PANEL_DAY).toBe(0xF0F4FF)
    expect(CEIL_PANEL_NIGHT).toBe(0x2E3A52)
    expect(PEND_BULB_DAY).toBe(0xFFF3D6)
    expect(PEND_BULB_NIGHT).toBe(0x3A3426)
    const src = readFileSync(resolve(__dirname, '../scene/parts/room.js'), 'utf8')
    expect(src).toContain("from './ceiling_fixtures_palette.js'")
    const code = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')
    expect(code).not.toContain('0xF0F4FF')
    expect(code).not.toContain('0xFFF3D6')
    expect(code).not.toContain('0x2E3A52')
    expect(code).not.toContain('0x3A3426')
  })
  it('vignette & seam tergambar dgn konstanta (pola guard canvas)', () => {
    const ops = []
    const stops = []
    const ctx = {
      createLinearGradient: () => ({ addColorStop() {} }),
      createRadialGradient: () => ({ addColorStop: (o, c) => stops.push(c) }),
      fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
      set lineWidth(v) { ops.push(['lw', v]) },
      set strokeStyle(v) { ops.push(['ss', v]) },
      set fillStyle(v) { ops.push(['fs', v]) },
    }
    drawCeiling(ctx)
    expect(stops).toEqual([CEIL_VIGNETTE_IN, CEIL_VIGNETTE_OUT])
    expect(ops).toContainEqual(['ss', CEIL_SEAM])
    expect(ops).toContainEqual(['ss', CEIL_BEVEL])
  })
})
