import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PB_DIVIDER } from '../lib/ui_palette.js'

const src = readFileSync(join(process.cwd(), 'src/scene/parts/projectboard_data.js'), 'utf8')

describe('siklus 467 — palet divider strip papan satu sumber', () => {
  it('nilai historis terkunci', () => {
    expect(PB_DIVIDER).toBe('#44506a')
  })
  it('delegasi satu sumber — 0 literal warna di projectboard_data', () => {
    expect(src.includes('#44506a'), 'literal #44506a masih ada').toBe(false)
    expect(src.includes('PB_DIVIDER'), 'delegasi PB_DIVIDER hilang').toBe(true)
  })
  it('pemakaian di titik asal (3 pemisah segmen strip)', () => {
    const uses = (src.match(/col: div/g) || []).length
    expect(uses).toBeGreaterThanOrEqual(3)
  })
  it('anti-poisoning: nilai bukan turunan SCENE_MUTED (#8fa3bd)', () => {
    expect(PB_DIVIDER.toLowerCase()).not.toBe('#8fa3bd')
  })
})
