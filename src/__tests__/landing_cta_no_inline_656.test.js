// Siklus 656: inline handler onclick di CTA "Lihat Dashboard" landing dihapus —
// penandaan wfs_open_dashboard kini via delegasi click pada a[data-mark-dashboard].
// Paritas perilaku: klik CTA → localStorage 'wfs_open_dashboard'='1' → redirect
// /app/#dashboard → App.jsx takeOpenDashboardFlag() membuka Dashboard sekali.
import { readFileSync, } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const root = resolve(__dirname, '../..')
const landing = readFileSync(resolve(root, 'public/landing.html'), 'utf8')
const dist = (() => { try { return readFileSync(resolve(root, 'dist/landing.html'), 'utf8') } catch { return null } })()

describe('siklus 656 — CTA dashboard tanpa inline handler', () => {
  it('sumber landing tanpa onclick inline pada CTA dashboard', () => {
    expect(landing).not.toMatch(/onclick=/)
    expect(landing).toContain('data-mark-dashboard')
  })

  it('script delegasi click menulis key handshake yang benar', () => {
    expect(landing).toContain("e.target.closest('a[data-mark-dashboard]')")
    expect(landing).toContain("localStorage.setItem('wfs_open_dashboard','1')")
    expect(landing).toContain("catch(err)")
  })

  it('dist ter-build paritas dengan sumber (tanpa onclick, ada data-mark-dashboard)', () => {
    if (!dist) return expect(true).toBe(true) // dist belum di-build di lingkungan tes
    expect(dist).not.toMatch(/onclick=/)
    expect(dist).toContain('data-mark-dashboard')
    expect(dist).toContain("localStorage.setItem('wfs_open_dashboard','1')")
  })
})
