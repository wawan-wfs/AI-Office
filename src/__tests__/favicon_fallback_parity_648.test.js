import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolve } from 'node:path'

const root = resolve(__dirname, '../..')
const index = readFileSync(resolve(root, 'index.html'), 'utf8')
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8')
const distIndex = readFileSync(resolve(root, 'dist/index.html'), 'utf8')
const distLanding = readFileSync(resolve(root, 'dist/landing.html'), 'utf8')

const pngLink = '<link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png"'

describe('favicon fallback parity 648', () => {
  it('index & landing each declare svg + png icon fallback + apple-touch', () => {
    for (const html of [index, landing]) {
      expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg"')
      expect(html).toContain(pngLink)
      expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png"')
    }
  })

  it('png fallback declared after svg icon (cascade order: svg wins in modern, png for legacy)', () => {
    for (const html of [index, landing]) {
      const iSvg = html.indexOf('<link rel="icon" type="image/svg+xml"')
      const iPng = html.indexOf(pngLink)
      expect(iSvg).toBeGreaterThanOrEqual(0)
      expect(iPng).toBeGreaterThan(iSvg)
    }
  })

  it('dist (deployed) pages contain both icon declarations', () => {
    for (const html of [distIndex, distLanding]) {
      expect(html).toContain('href="/favicon.svg"')
      expect(html).toContain('type="image/png" sizes="32x32" href="/icon-192.png"')
      expect(html).toContain('href="/apple-touch-icon.png"')
    }
  })
})
