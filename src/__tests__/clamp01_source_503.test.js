// Siklus 503: guard satu sumber clamp01 — salinan lokal di effects.js dihapus,
// kini mengimpor clamp01 dari lib/math_util.js (pola 361/362).
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { clamp01 } from '../lib/math_util.js'
import { robotIdle } from '../scene/parts/effects.js'

const ROOT = resolve(__dirname, '..')

describe('siklus 503 — clamp01 satu sumber', () => {
  it('effects.js tidak lagi mendefinisikan clamp01 lokal', () => {
    const src = readFileSync(join(ROOT, 'scene/parts/effects.js'), 'utf8')
    expect(src).not.toMatch(/const\s+clamp01\s*=/)
    expect(src).toMatch(/import\s*\{[^}]*clamp01[^}]*\}\s*from\s*'.*math_util/)
  })

  it('tidak ada salinan pola clamp01 ternary lain di src non-test', () => {
    const offenders = []
    const walk = (dir) => {
      for (const f of readdirSync(dir, { withFileTypes: true })) {
        if (f.name === '__tests__' || f.name === 'node_modules') continue
        const p = join(dir, f.name)
        if (f.isDirectory()) walk(p)
        else if (/\.(js|jsx)$/.test(f.name) && f.name !== 'math_util.js') {
          const s = readFileSync(p, 'utf8')
          if (/v\s*<\s*0\s*\?\s*0\s*:\s*v\s*>\s*1\s*\?\s*1\s*:\s*v/.test(s)) offenders.push(p)
        }
      }
    }
    walk(ROOT)
    expect(offenders).toEqual([])
  })

  it('clamp01 math_util kontrak anti-poisoning tetap', () => {
    expect(clamp01(0.3)).toBe(0.3)
    expect(clamp01(-5)).toBe(0)
    expect(clamp01(2)).toBe(1)
    expect(clamp01(NaN)).toBe(0)
    expect(clamp01('x')).toBe(0)
  })

  it('robotIdle konsumen clamp01 tetap benar (nilai 0..1)', () => {
    const d = robotIdle(0)
    expect(d).toBeTruthy()
    for (const v of Object.values(d).filter(x => typeof x === 'number')) {
      expect(Number.isFinite(v)).toBe(true)
    }
  })
})
