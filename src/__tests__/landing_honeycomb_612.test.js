import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Siklus 612: landing.html diselaraskan dgn identitas honeycomb master.
const root = resolve(__dirname, '../..')
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8')
const master = readFileSync(resolve(root, 'public/icon-master.svg'), 'utf8')

describe('landing honeycomb parity (612)', () => {
  it('theme-color landing == theme_color manifest #000C1E', () => {
    expect(landing).toContain('content="#000C1E"')
    expect(landing).not.toContain('#010722"')
  })

  it('logo nav memakai mark honeycomb master (bukan dot generik)', () => {
    expect(landing).toContain('src="/icon-master.svg"')
    expect(landing).not.toMatch(/<span class="dot"/)
  })

  it('icon-master.svg tetap struktur 6 sel satelit + hero (8 poligon + W)', () => {
    expect((master.match(/<polygon/g) || []).length).toBe(8)
    expect(master).toContain('>W<')
  })

  it('aset brand paritas: favicon == master byte-identik', () => {
    const fav = readFileSync(resolve(root, 'public/favicon.svg'), 'utf8')
    expect(fav).toBe(master)
  })
})
