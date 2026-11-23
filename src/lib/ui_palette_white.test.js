import { describe, it, expect } from 'vitest'
import {
  whiteAlpha, greenAlpha, cyanAlpha, amberAlpha,
  GREEN_RGB, CYAN_RGB, AMBER_RGB,
} from './ui_palette.js'

describe('alpha helpers satu sumber (siklus 412)', () => {
  it('whiteAlpha menghasilkan nilai historis literal di SettingsModal/AgentInspector', () => {
    expect(whiteAlpha(0.02)).toBe('rgba(255,255,255,0.02)')
    expect(whiteAlpha(0.03)).toBe('rgba(255,255,255,0.03)')
    expect(whiteAlpha(0.04)).toBe('rgba(255,255,255,0.04)')
    expect(whiteAlpha(0.05)).toBe('rgba(255,255,255,0.05)')
    expect(whiteAlpha(0.06)).toBe('rgba(255,255,255,0.06)')
    expect(whiteAlpha(0.08)).toBe('rgba(255,255,255,0.08)')
    expect(whiteAlpha(0.1)).toBe('rgba(255,255,255,0.1)')
    expect(whiteAlpha(0.12)).toBe('rgba(255,255,255,0.12)')
  })

  it('greenAlpha/cyanAlpha/amberAlpha terkunci ke triplet warna kanonik', () => {
    expect(GREEN_RGB).toBe('16,229,160') // = TASK_STATUS_COLORS.done
    expect(greenAlpha(0.08)).toBe('rgba(16,229,160,0.08)')
    expect(greenAlpha(0.15)).toBe('rgba(16,229,160,0.15)')
    expect(greenAlpha(0.25)).toBe('rgba(16,229,160,0.25)')
    expect(CYAN_RGB).toBe('0,240,255') // = CYAN_NEON
    expect(cyanAlpha(0.08)).toBe('rgba(0,240,255,0.08)')
    expect(AMBER_RGB).toBe('245,158,11') // = AMBER_ACCENT
    expect(amberAlpha(0.12)).toBe('rgba(245,158,11,0.12)')
    expect(amberAlpha(0.3)).toBe('rgba(245,158,11,0.3)')
  })

  it('anti-poisoning: alpha invalid menghasilkan null', () => {
    for (const fn of [whiteAlpha, greenAlpha, cyanAlpha, amberAlpha]) {
      expect(fn(NaN)).toBeNull()
      expect(fn(Infinity)).toBeNull()
      expect(fn(-0.1)).toBeNull()
      expect(fn(1.1)).toBeNull()
    }
  })

  it('0 literal rgba(255,255,255 / rgba(16,229 tersisa di kedua komponen', async () => {
    const fs = await import('node:fs')
    for (const f of ['src/components/SettingsModal.jsx', 'src/components/AgentInspector.jsx']) {
      const s = fs.readFileSync(f, 'utf8')
      expect((s.match(/rgba\((255,255,255|16,229,160|0,240,255|245,158,11)/g) || []).length).toBe(0)
    }
  })
})
