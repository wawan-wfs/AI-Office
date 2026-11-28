import { describe, it, expect } from 'vitest'
import { isSafeHttpUrl } from '../lib/url_safe.js'
import fs from 'fs'
import path from 'path'

describe('guard url_safe 577', () => {
  it('validator menolak javascript:/data:/non-string, menerima http(s)', () => {
    expect(isSafeHttpUrl('https://example.com/x')).toBe(true)
    expect(isSafeHttpUrl('http://localhost:9503/preview')).toBe(true)
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeHttpUrl('JAVASCRIPT:alert(1)')).toBe(false)
    expect(isSafeHttpUrl('data:text/html,<script>1</script>')).toBe(false)
    expect(isSafeHttpUrl({ toString: () => 'javascript:x' })).toBe(false)
    expect(isSafeHttpUrl(['https://x'])).toBe(false)
    expect(isSafeHttpUrl(null)).toBe(false)
    expect(isSafeHttpUrl(undefined)).toBe(false)
    expect(isSafeHttpUrl('')).toBe(false)
  })

  it('anti-regresi: ShConsole Buka Preview tidak window.open tanpa guard', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../components/ShConsole.jsx'), 'utf8')
    expect(src).toContain('isSafeHttpUrl')
    expect(src).not.toMatch(/onClick=\{\(\) => window\.open\(p\./)
  })
})
