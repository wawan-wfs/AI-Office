import { describe, it, expect } from 'vitest'
import {
  whiteAlpha, greenAlpha, goldAlpha, failedAlpha, amberAlpha, shadowAlpha,
  GOLD_RGB, FAILED_RGB,
} from './ui_palette.js'
import { GOLD_ACCENT, ERROR_TEXT } from './ui_palette.js'

describe('alpha helpers komponen UI (siklus 413)', () => {
  it('goldAlpha terkunci ke triplet GOLD_ACCENT (#d8bb84) nilai historis', () => {
    expect(GOLD_RGB).toBe('216,187,132')
    expect(GOLD_ACCENT).toBe('#d8bb84')
    expect(goldAlpha(0.07)).toBe('rgba(216,187,132,0.07)')
    expect(goldAlpha(0.3)).toBe('rgba(216,187,132,0.3)')
  })

  it('failedAlpha = FAILED_RGB = TASK_STATUS_COLORS.failed nilai historis', () => {
    expect(FAILED_RGB).toBe('239,68,68')
    expect(failedAlpha(0.12)).toBe('rgba(239,68,68,0.12)')
    expect(failedAlpha(0.3)).toBe('rgba(239,68,68,0.3)')
  })

  it('shadowAlpha & amberAlpha nilai historis overlay/badge', () => {
    expect(shadowAlpha(0.45)).toBe('rgba(0,0,0,0.45)')
    expect(shadowAlpha(0.55)).toBe('rgba(0,0,0,0.55)')
    expect(amberAlpha(0.2)).toBe('rgba(245,158,11,0.2)')
    expect(whiteAlpha(0.05)).toBe('rgba(255,255,255,0.05)')
  })

  it('anti-poisoning: alpha invalid menghasilkan null', () => {
    for (const fn of [goldAlpha, failedAlpha, shadowAlpha]) {
      expect(fn(NaN)).toBeNull()
      expect(fn(Infinity)).toBeNull()
      expect(fn(-0.1)).toBeNull()
      expect(fn(1.1)).toBeNull()
    }
  })

  it('0 literal rgba numeric tersisa di 5 komponen siklus 413', async () => {
    const fs = await import('node:fs')
    const files = [
      'src/components/ProjectPanel.jsx',
      'src/components/ActivityLog.jsx',
      'src/components/TeamStats.jsx',
      'src/components/CsWidget.jsx',
      'src/components/ShConsole.jsx',
    ]
    for (const f of files) {
      const s = fs.readFileSync(f, 'utf8')
      expect((s.match(/rgba\(\d+\s*,\s*\d+\s*,\s*\d+/g) || []).length).toBe(0)
    }
  })
})
