import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { allAgents } from '../scene/parts/agents_spec.js'
import { EXTENDED_SPECIALISTS } from '../scene/parts/extended_desks.js'

// Siklus 609: guard aset ikon PWA — ikon diregenerasi dari icon-master.svg
// (honeycomb 6 sel satelit + hero cell amber dgn W), harus tetap ada, ukuran
// valid, dan jumlah agen scene tetap 26 agar tagline meta konsisten.

function pngSize(buf) {
  // PNG IHDR: width @16..19, height @20..23 (big-endian)
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

describe('ikon PWA honeycomb (siklus 609)', () => {
  const files = [
    ['public/icon-512.png', 512],
    ['public/icon-192.png', 192],
    ['public/apple-touch-icon.png', 180],
  ]

  it.each(files)('%s adalah PNG valid %ix%i', (path, size) => {
    const buf = readFileSync(path)
    expect(buf.slice(1, 4).toString()).toBe('PNG')
    const { w, h } = pngSize(buf)
    expect(w).toBe(size)
    expect(h).toBe(size)
    expect(buf.length).toBeGreaterThan(2000)
  })

  it('master SVG honeycomb berisi 6 satelit + hero hexagon dgn W', () => {
    const svg = readFileSync('public/icon-master.svg', 'utf8')
    expect((svg.match(/<polygon/g) || []).length).toBe(8) // 6 satelit + 2 hero (ring + inner)
    expect(svg).toContain('>W<')
    // background gelap konsisten dgn manifest theme_color
    expect(svg).toContain('#000C1E')
  })

  it('jumlah agen scene tetap 26 (sumber tagline ikon/meta)', () => {
    expect(allAgents().length + EXTENDED_SPECIALISTS.length).toBe(26)
  })
})
