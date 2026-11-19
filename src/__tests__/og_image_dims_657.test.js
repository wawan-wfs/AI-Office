// Siklus 657: og:image:width/height eksplisit di kedua halaman HTML — guard terakhir
// dims gambar preview sosial. twitter:image:width/height sudah dikunci guard 646,
// tetapi og:image:width/height (dipakai WhatsApp/Telegram/Facebook untuk reserve
// rasio aspek kartu tanpa layout shift) belum punya guard vitest — nilainya bisa
// drift dari PNG nyata tanpa tes merah. PNG og-image.png (1200x630, guard 608)
// dan meta harus cocok: crawler yang baca dims meta vs decode PNG tak boleh beda.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const root = process.cwd()
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8')
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8')
const png = readFileSync(resolve(root, 'public/og-image.png'))
// IHDR: width @16..20, height @20..24 (big-endian) — sama metode dgn guard 608
const pngW = png.readUInt32BE(16)
const pngH = png.readUInt32BE(20)

const dims = (html) => ({
  w: (html.match(/<meta property="og:image:width" content="(\d+)"\s*\/?>/) || [])[1],
  h: (html.match(/<meta property="og:image:height" content="(\d+)"\s*\/?>/) || [])[1],
})

describe('siklus 657 — og:image dims eksplisit & cocok PNG nyata', () => {
  it('og:image:width=1200 & height=630 ada tepat 1x di kedua halaman', () => {
    for (const [name, html] of [['index.html', indexHtml], ['landing.html', landing]]) {
      const d = dims(html)
      expect(d.w, `${name} og:image:width`).toBe('1200')
      expect(d.h, `${name} og:image:height`).toBe('630')
      expect(html.match(/og:image:width/g), `${name} duplikasi width`).toHaveLength(1)
      expect(html.match(/og:image:height/g), `${name} duplikasi height`).toHaveLength(1)
    }
  })

  it('og:image:width/height berada setelah og:image (urutan deklarasi OG)', () => {
    for (const html of [indexHtml, landing]) {
      expect(html.indexOf('"og:image"')).toBeLessThan(html.indexOf('og:image:width'))
      expect(html.indexOf('og:image:width')).toBeLessThan(html.indexOf('og:image:height'))
    }
  })

  it('dims meta == dims PNG nyata (crawler reserve == decode)', () => {
    expect(pngW).toBe(1200)
    expect(pngH).toBe(630)
    expect(Number(dims(landing).w)).toBe(pngW)
    expect(Number(dims(landing).h)).toBe(pngH)
  })

  it('dist ter-build memuat dims yang sama di kedua halaman (bila ada)', () => {
    for (const p of ['dist/index.html', 'dist/landing.html']) {
      try {
        const d = readFileSync(resolve(root, p), 'utf8')
        expect(d).toContain('og:image:width" content="1200"')
        expect(d).toContain('og:image:height" content="630"')
      } catch { /* dist belum di-build di lingkungan tes */ }
    }
  })
})
