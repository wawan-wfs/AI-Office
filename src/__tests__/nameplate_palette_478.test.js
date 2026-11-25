import { describe, it, expect } from 'vitest'
import { NP_BG } from '../lib/ui_palette.js'
import { NAMEPLATE } from '../scene/parts/nameplate_spec.js'

describe('siklus 478 — nameplate BG satu sumber', () => {
  it('nilai terkunci di palet', () => {
    expect(NP_BG).toBe('rgba(8,12,22,0.88)')
  })
  it('spec nameplate delegasi penuh ke palet', () => {
    expect(NAMEPLATE.BG).toBe(NP_BG)
  })
  it('anti-poisoning: NP_BG berbeda dari LBL_BODY_BG', async () => {
    const { LBL_BODY_BG } = await import('../lib/ui_palette.js')
    expect(NP_BG).not.toBe(LBL_BODY_BG)
  })
  it('literal rgba(8,12,22 hanya 1× di palet', async () => {
    const fs = await import('node:fs')
    const pal = fs.readFileSync('src/lib/ui_palette.js', 'utf8')
    expect((pal.match(/rgba\(8,12,22/g) || []).length).toBe(1)
    const spec = fs.readFileSync('src/scene/parts/nameplate_spec.js', 'utf8')
    expect((spec.match(/rgba\(8,12,22/g) || []).length).toBe(0)
  })
})
