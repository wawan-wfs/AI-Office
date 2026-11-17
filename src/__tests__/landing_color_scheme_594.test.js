// Siklus 594: landing.html wajib mendeklarasikan color-scheme dark (paritas dgn index.html siklus 593).
// Tanpa ini, kontrol native browser di landing (select, scrollbar, autofill) dirender skema terang di tema gelap.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const landing = readFileSync(fileURLToPath(new URL('../../public/landing.html', import.meta.url)), 'utf8')

describe('landing color-scheme dark parity (siklus 594)', () => {
  it('punya meta color-scheme dark di head', () => {
    expect(landing).toContain('<meta name="color-scheme" content="dark">')
  })
  it('CSS reset deklarasi color-scheme:dark', () => {
    expect(landing).toMatch(/color-scheme:dark/)
  })
  it('tetap dark-only: tidak ada color-scheme light/normal', () => {
    expect(landing).not.toMatch(/color-scheme[:=]\s*"?(light|light dark|normal)/)
  })
})
