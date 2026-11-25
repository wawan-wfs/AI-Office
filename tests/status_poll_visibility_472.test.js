// Siklus 472 — poll status badge interval 20 dtk (OfficeScene.js) di-gerbang
// visibilityState. Dulu hanya guard pageHidden (di-set onVis); bila listener
// visibilitychange mati/remount, tick interval tetap fetch di latar. Kini tick
// juga skip langsung saat document.visibilityState === 'hidden'.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('status poll visibility gate (472)', () => {
  const src = read('src/scene/OfficeScene.js')

  it('pollStatus di-gerbang hidden (selain pageHidden/pollStopped)', () => {
    const gate = src.match(/async function pollStatus\(\)\{\s*\n\s*if\(([^)]*)\) return/)
    expect(gate, 'guard pollStatus tetap ada').toBeTruthy()
    expect(gate[1]).toContain('pollStopped')
    expect(gate[1]).toContain('pageHidden')
    expect(gate[1]).toContain("visibilityState==='hidden'")
  })

  it('interval poll tetap tunggal 20 dtk + timeout awal 4 dtk (tidak digandakan)', () => {
    expect(src).toMatch(/__intervals\.push\(setInterval\(pollStatus,20000\)\)/)
    expect(src).toMatch(/__timeouts\.push\(setTimeout\(pollStatus,4000\)\)/)
    expect((src.match(/setInterval\(pollStatus/g) || []).length).toBe(1)
  })

  it('anti-regresi: onVis tetap refresh instan via __pollBadges saat kembali visible', () => {
    expect(src).toContain('window.__pollBadges=pollStatus')
    expect(src).toMatch(/if\(window\.__pollBadges\)window\.__pollBadges\(\)/)
  })

  it('anti-poisoning: cleanup destroy tetap menghentikan poll async (pollStopped)', () => {
    expect(src).toMatch(/__destroyHooks\.push\(\(\)=>\{pollStopped=true;\}\)/)
  })
})
