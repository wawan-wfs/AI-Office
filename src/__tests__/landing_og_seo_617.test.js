// Siklus 617: paritas SEO landing.html vs index.html — meta description wajib identik
// (sebelumnya beda redaksi → Google memilih snippet berbeda per halaman untuk URL kanonik yang sama)
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test, expect } from 'vitest'

const here = fileURLToPath(new URL('.', import.meta.url))
const read = (p) => readFileSync(resolve(here, '../../public', p), 'utf8')
const landing = read('landing.html')
const index = read('../index.html')

const meta = (html, attr, name) =>
  html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]+)"`))?.[1]

describe('landing.html SEO parity (617)', () => {
  test('meta description landing == index (satu URL kanonik, satu snippet)', () => {
    expect(meta(landing, 'name', 'description'))
      .toBe(meta(index, 'name', 'description'))
  })

  test('index.html juga memuat meta description (tidak hilang saat refactor)', () => {
    expect(meta(index, 'name', 'description')).toBeTruthy()
    expect(meta(index, 'name', 'description')).toContain('26 agen AI')
  })

  test('description menyebut nilai inti produk', () => {
    const d = meta(landing, 'name', 'description')
    expect(d).toContain('26 agen')
    expect(d).toContain('3D')
  })
})
