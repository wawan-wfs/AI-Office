// Siklus 414: palet tekstur dinding SIANG satu sumber — walls.js tak punya literal lagi.
import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { WALL_UPPER_DAY, WALL_WOOD_DAY, WALL_NIGHT } from '../scene/parts/wall_canvas.js'

const wallsSrc = readFileSync(new URL('../scene/parts/walls.js', import.meta.url), 'utf8')

describe('palet dinding siang satu sumber (414)', () => {
  test('nilai historis terkunci', () => {
    expect(WALL_UPPER_DAY.base).toBe('#E6EAF1')
    expect(WALL_UPPER_DAY.line).toBe('rgba(120,138,165,.48)')
    expect(WALL_WOOD_DAY.base).toBe('#8A6244')
    expect(WALL_WOOD_DAY.line).toBe('rgba(40,25,10,.40)')
  })

  test('walls.js delegasi penuh — 0 literal warna tekstur tersisa', () => {
    expect(wallsSrc).not.toMatch(/rgba\(120,138,165/)
    expect(wallsSrc).not.toMatch(/rgba\(40,25,10/)
    expect(wallsSrc).toMatch(/WALL_UPPER_DAY\.base/)
    expect(wallsSrc).toMatch(/WALL_WOOD_DAY\.base/)
  })

  test('beda kontras dengan palet malam', () => {
    expect(WALL_UPPER_DAY.base).not.toBe(WALL_NIGHT.upper.base)
    expect(WALL_WOOD_DAY.base).not.toBe(WALL_NIGHT.wood.base)
  })
})
