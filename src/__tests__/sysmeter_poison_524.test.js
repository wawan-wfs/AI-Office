// Siklus 524: anti-poisoning SysMeter — terakhir dari seri 512-523.
// Field API (agents/load/ram/disk_used_gb/disk_total_gb) bentuk sah non-string
// (numerik string, objek detail) dulu dirender MENTAH sebagai React child /
// interpolasi aria-label → "Objects are not valid as a React child" atau
// "[object Object]" di chip meter host. Kini semua dinormalisasi via clip.js.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeClipText } from '../lib/clip.js'

const src = readFileSync('src/components/SysMeter.jsx', 'utf8')

describe('sysmeter_poison_524', () => {
  it('kontrak normalizeClipText: null/angka/objek/siklik aman, bukan [object Object]', () => {
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
    expect(normalizeClipText(0)).toBe('0')
    expect(normalizeClipText(12.5)).toBe('12.5')
    expect(normalizeClipText({ a: 1 })).toContain('a')
    expect(normalizeClipText({ a: 1 })).not.toBe('[object Object]')
    const cyc = {}; cyc.self = cyc
    expect(typeof normalizeClipText(cyc)).toBe('string')
  })

  it('tidak ada field API mentah d.agents/d.load/d.ram/d.disk_* tersisa di JSX SysMeter', () => {
    const body = src.split('// Meter status host')[1] || src
    const raw = body.match(/\{d\.(agents|load|ram|disk_used_gb|disk_total_gb)[\s}?]/g) || []
    expect(raw).toEqual([])
    // semua pemakaian field API melewati normalizer
    const uses = body.match(/d\.(agents|load|ram|disk_used_gb|disk_total_gb)/g) || []
    expect(uses.length).toBeGreaterThan(0)
    for (const m of body.matchAll(/(?:norm\(d\.\w+\)|fmtUptime\(d\.\w+\))/g)) {
      expect(m[0]).toBeTruthy()
    }
    expect(src).toMatch(/normalizeClipText/)
    // pastikan body JSX tak memakai alias lain selain norm( yang diimpor dari clip.js
    expect(src).toMatch(/import \{ normalizeClipText as norm \} from '\.\.\/lib\/clip\.js'/)
  })

  it('guard lama a11y 415 tetap kompatibel: semua sm-item tetap punya aria-label', () => {
    const lines = src.split('\n').filter(l => l.includes('sm-item') && !l.includes('aria-label'))
    lines.forEach(l => expect(l.includes('data usang') || l.includes('Gateway offline')).toBe(true))
  })
})
