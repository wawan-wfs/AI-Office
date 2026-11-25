// Siklus 470 — forceVisible interval 500ms dibuang (event-driven latch) &
// hostIv 20 dtk di-gerbang visibility. Dulu projectboard menjalankan interval
// 500ms walau tab visible (hanya latch + cek opacity → kedip CPU sia-sia) dan
// tick HOST strip 20 dtk tetap repaint saat tab hidden.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('projectboard tickless visibility (470)', () => {
  const src = read('src/scene/parts/projectboard.js')

  it('forceVisible interval 500ms sudah TIDAK ADA (event-driven)', () => {
    expect(src).not.toMatch(/const forceVisible = setInterval\(/)
    expect(src).not.toMatch(/\}, 500\)/)
  })

  it('latch pasca-visible event-driven via onVisLatch + restoreFullVisible', () => {
    expect(src).toContain('function onVisLatch()')
    expect(src).toContain('restoreFullVisible()')
    expect(src).toContain("__visHidden = false; restoreFullVisible()")
    // listener terpasang & dibersihkan berpasangan
    expect(src).toMatch(/document\.addEventListener\('visibilitychange', onVisLatch\)/)
    expect(src).toMatch(/document\.removeEventListener\('visibilitychange', onVisLatch\)/)
  })

  it('hostIv 20 dtk di-gerbang hidden', () => {
    const host = src.match(/const hostIv = setInterval\(\(\) => \{(.*)\}, 20000\)/)
    expect(host, 'hostIv tetap ada').toBeTruthy()
    expect(host[1]).toContain("document.visibilityState === 'hidden'")
  })

  it('anti-poisoning: destroy tetap membersihkan connIv + hostIv + kedua listener', () => {
    expect(src).toContain('clearInterval(connIv)')
    expect(src).toContain('clearInterval(hostIv)')
    expect(src).toMatch(/removeEventListener\('visibilitychange', onVis\)/)
  })
})
