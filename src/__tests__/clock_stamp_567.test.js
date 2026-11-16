// Siklus 567: stempel log aktivitas jadi epoch ms terukur.
// clockStampMs: satu sumber (format_time.js) — Date valid → ms finite,
// Date rusak/non-Date → null (pemanggil App pakai fallback 0).
import { describe, it, expect } from 'vitest'
import { clockStampMs } from '../lib/format_time.js'

describe('clockStampMs (siklus 567)', () => {
  it('Date valid → epoch ms finite', () => {
    const d = new Date('2026-11-16T09:00:00')
    const ms = clockStampMs(d)
    expect(ms).toBe(d.getTime())
    expect(Number.isFinite(ms)).toBe(true)
  })

  it('default parameter: new Date() → ms finite sekarang', () => {
    const ms = clockStampMs()
    expect(Math.abs(ms - Date.now())).toBeLessThan(5000)
  })

  it('Date rusak → null', () => {
    expect(clockStampMs(new Date('nope'))).toBeNull()
    expect(clockStampMs({})).toBeNull()
    expect(clockStampMs(null)).toBeNull()
  })
})
