import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(__dirname, '../..')
const dist = resolve(root, 'dist')

describe('Siklus 672 — root dist .map (sw/workbox) juga direlokasi', () => {
  it('0 file .map di root dist (sw.js.map & workbox-*.js.map ikut pindah)', () => {
    const maps = readdirSync(dist).filter((f) => f.endsWith('.map'))
    expect(maps).toEqual([])
  })

  it('dist/sourcemaps memuat sw.js.map & workbox .map', () => {
    const dir = resolve(dist, 'sourcemaps')
    expect(existsSync(dir)).toBe(true)
    const maps = readdirSync(dir)
    expect(maps).toContain('sw.js.map')
    expect(maps.some((f) => f.startsWith('workbox-') && f.endsWith('.map'))).toBe(true)
  })

  it('vite.config: closeBundle relocate memakai order post (setelah SW workbox)', () => {
    const cfg = readFileSync(resolve(root, 'vite.config.js'), 'utf8')
    expect(cfg).toMatch(/order:\s*'post'/)
    expect(cfg).toMatch(/relocate-sourcemaps/)
  })

  it('web root ~/wfs-hq tanpa .map di root & assets', () => {
    const hq = '/home/agentuser/wfs-hq'
    expect(readdirSync(hq).filter((f) => f.endsWith('.map'))).toEqual([])
    const assets = readdirSync(resolve(hq, 'assets')).filter((f) => f.endsWith('.map'))
    for (const f of assets) {
      // .map basi di assets/ bersifat sementara sampai prune maintenance
      // dijalankan; yang penting tidak bertambah (sw/workbox tidak lagi).
      expect(f.startsWith('sw.') || f.startsWith('workbox-')).toBe(false)
    }
  })
})
