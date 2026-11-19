// Siklus 652: FAQ landing naik ke markup semantik — pertanyaan <h3> dalam
// <section class="faq-item"> (dulu <b> tanpa struktur: outline dokumen salah,
// screen reader tidak menandai pertanyaan). Teks & JSON-LD FAQPage tak berubah.
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const root = new URL('../..', import.meta.url).pathname
const pub = readFileSync(root + 'public/landing.html', 'utf8')
const dist = readFileSync(root + 'dist/landing.html', 'utf8')

describe('Siklus 652 — FAQ markup semantik', () => {
  it('4 pertanyaan FAQ berupa <h3> di dalam <section class="faq-item"> (sumber)', () => {
    const items = pub.match(/<section class="faq-item"><h3 lang="id">([^<]+)<\/h3><p lang="id">/g) || []
    expect(items.length).toBe(4)
    // tidak ada lagi pertanyaan non-semantik <b>...</b><p>
    expect(pub).not.toMatch(/<b>Apakah ini demo/)
  })

  it('h3 pertanyaan ditata (CSS .faq-item h3), gaya b lama dihapus', () => {
    expect(pub).toMatch(/\.how\.faq \.faq-item h3 \{/)
    expect(pub).not.toMatch(/\.how\.faq \.faq-item b \{/)
  })

  it('dist ter-deploy memuat markup semantik yang sama', () => {
    expect((dist.match(/<section class="faq-item"><h3 lang="id">/g) || []).length).toBe(4)
    expect(dist).not.toContain('<b>Apakah ini demo')
  })
})
