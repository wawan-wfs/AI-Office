// Siklus 642: FAQ landing — konten FAQ + JSON-LD FAQPage selaras
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const pub = readFileSync(new URL('../../public/landing.html', import.meta.url), 'utf8')
const dist = readFileSync(new URL('../../dist/landing.html', import.meta.url), 'utf8')

function faqLd(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  const parsed = blocks.map(m => { try { return JSON.parse(m[1]) } catch { return null } }).filter(Boolean)
  return parsed.find(d => d['@type'] === 'FAQPage')
}

describe('Siklus 642: FAQ landing + FAQPage JSON-LD', () => {
  it('HTML FAQ: 4 faq-item di dalam .how.faq sebelum </main>', () => {
    const main = pub.slice(pub.indexOf('<main'), pub.indexOf('</main>'))
    expect(pub).toContain('class="how faq"')
    // Siklus 652: pertanyaan naik ke <h3 lang="id"> semantik dalam <section class="faq-item">
    expect((main.match(/<section class="faq-item">/g) || []).length).toBe(4)
    expect((main.match(/<h3 lang="id">/g) || []).length).toBe(4)
    expect(pub).toContain('FAQ</h2>')
  })

  it('JSON-LD FAQPage valid: 4 Question, teks answer selaras HTML', () => {
    const d = faqLd(pub)
    expect(d).toBeTruthy()
    expect(d.mainEntity.length).toBe(4)
    expect(d.mainEntity.every(q => q['@type'] === 'Question' && q.acceptedAnswer?.text)).toBe(true)
    const htmlAns = pub.match(/<h3 lang="id">Apakah ini demo atau software beneran\?<\/h3><p lang="id">([^<]+)<\/p>/)
    expect(htmlAns).toBeTruthy()
    expect(d.mainEntity[0].acceptedAnswer.text).toBe(htmlAns[1])
  })

  it('dist ter-deploy memuat FAQ HTML + FAQPage JSON-LD', () => {
    expect(dist).toContain('class="how faq"')
    expect(faqLd(dist)).toBeTruthy()
  })
})
