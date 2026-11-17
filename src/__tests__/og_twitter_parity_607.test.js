// Siklus 607: og:* vs twitter:* title/description index.html harus sinkron.
// Defek riil: twitter:title "WFS PROJECT — Autonomous AI Software House" vs
// og:title "WFS Project HQ — Kantor AI 3D", dan twitter:description beda redaksi
// dgn og:description → preview WhatsApp/Telegram (baca og) vs X/Twitter (baca
// twitter, og fallback jika twitter absen) menampilkan kartu berbeda.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test, expect } from 'vitest'

const here = fileURLToPath(new URL('.', import.meta.url))
const html = readFileSync(resolve(here, '../..', 'index.html'), 'utf8')

const metaContent = (name) => {
  const m = html.match(new RegExp(`<meta[^>]*(?:property|name)="${name}"[^>]*content="([^"]*)"`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:property|name)="${name}"`, 'i'))
  return m ? m[1] : null
}

describe('og/twitter preview parity index.html (607)', () => {
  test('twitter:title = og:title', () => {
    expect(metaContent('twitter:title')).toBe(metaContent('og:title'))
    expect(metaContent('twitter:title')).toBeTruthy()
  })

  test('twitter:description = og:description', () => {
    expect(metaContent('twitter:description')).toBe(metaContent('og:description'))
    expect(metaContent('twitter:description')).toContain('26 agen')
  })

  test('twitter:image = og:image', () => {
    expect(metaContent('twitter:image')).toBe(metaContent('og:image'))
  })

  test('twitter:image:alt & og:image:alt sama', () => {
    expect(metaContent('twitter:image:alt')).toBe(metaContent('og:image:alt'))
  })
})
