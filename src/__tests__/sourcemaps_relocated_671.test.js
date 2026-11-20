import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(__dirname, '../..')
const dist = resolve(root, 'dist')

describe('Siklus 671 — sourcemap direlokasi ke dist/sourcemaps', () => {
  it('dist/sourcemaps berisi .map (debug tersimpan)', () => {
    const dir = resolve(dist, 'sourcemaps')
    expect(existsSync(dir)).toBe(true)
    const maps = readdirSync(dir).filter((f) => f.endsWith('.map'))
    expect(maps.length).toBeGreaterThanOrEqual(10)
  })

  it('dist/assets TIDAK berisi .map (publish bundle bersih)', () => {
    const maps = readdirSync(resolve(dist, 'assets')).filter((f) => f.endsWith('.map'))
    expect(maps).toEqual([])
  })

  it('bundle JS tidak menyebut sourceMappingURL (hidden map)', () => {
    const assets = readdirSync(resolve(dist, 'assets')).filter((f) => f.endsWith('.js'))
    for (const f of assets) {
      const src = readFileSync(resolve(dist, 'assets', f), 'utf8')
      expect(src).not.toMatch(/sourceMappingURL/)
    }
  })

  it('precache sw.js tidak menyertakan .map', () => {
    const sw = readFileSync(resolve(dist, 'sw.js'), 'utf8')
    const m = sw.match(/precacheAndRoute\((\[.*?\]),\{\}\)/s)
    expect(m).not.toBeNull()
    expect(m[1]).not.toContain('.map')
  })
})
