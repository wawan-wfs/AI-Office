// Siklus 641: SEO landing — JSON-LD publisher Organization + og:image:alt
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const pub = readFileSync(new URL('../../public/landing.html', import.meta.url), 'utf8')
const dist = readFileSync(new URL('../../dist/landing.html', import.meta.url), 'utf8')

function ld(html) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  return JSON.parse(m[1])
}

describe('Siklus 641: JSON-LD publisher + og:image:alt', () => {
  it('JSON-LD valid & punya publisher Organization dengan logo', () => {
    const d = ld(pub)
    expect(d['@type']).toBe('WebSite')
    expect(d.publisher['@type']).toBe('Organization')
    expect(d.publisher.name).toBe('WFS Project')
    expect(d.publisher.logo.url).toMatch(/icon-512\.png$/)
    expect(d.publisher.logo.width).toBe(512)
    // fitur 621 tetap: SearchAction menarget kanonik '/', bukan /app/ yang diblokir
    expect(d.potentialAction.target).toMatch(/:9503\/#dashboard$/)
    expect(d.potentialAction.target).not.toContain('/app/')
  })

  it('og:image punya alt text (og:image:alt)', () => {
    expect(pub).toMatch(/<meta property="og:image:alt" content="[^"]+"/)
  })

  it('dist ter-deploy memuat keduanya', () => {
    const d = ld(dist)
    expect(d.publisher.logo.url).toMatch(/icon-512\.png$/)
    expect(dist).toContain('og:image:alt')
  })
})
