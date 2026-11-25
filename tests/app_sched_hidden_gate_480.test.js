// Siklus 480 — fetch scheduler status (App.jsx) di-skip saat tab hidden.
// Dulu scheduler setTimeout tick() tiap STALE_AFTER_MS (30 dtk) BAHKAN saat
// hidden → 1 fetch status/30 dtk di latar sia-sia: data tak terlihat, dan
// onVis sudah men-tick SEGERA saat kembali visible. Loop tetap berjalan
// (murah) agar state timer tak direkonstruksi; hanya fetch yang di-gerbang.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('app scheduler hidden-fetch gate (480)', () => {
  const src = read('src/App.jsx')

  it('scheduler skip tick() saat tab hidden (fetch berhenti di latar)', () => {
    const sched = src.match(/const schedule = \(\) => \{([\s\S]*?)\n    \}\n/)
    expect(sched, 'scheduler setTimeout tetap ada').toBeTruthy()
    expect(sched[1]).toContain('document.visibilityState !== \'hidden\'')
    // gate datang SEBELUM tick(), bukan sesudah
    expect(sched[1].indexOf("visibilityState !== 'hidden'")).toBeLessThan(sched[1].indexOf('tick()'))
  })

  it('loop schedule tetap berjalan saat hidden (state timer direkursif, bukan dihentikan)', () => {
    const sched = src.match(/const schedule = \(\) => \{([\s\S]*?)\n    \}\n/)
    const body = sched[1].split("visibilityState !== 'hidden'")[1]
    expect(body).toContain('schedule()')
  })

  it('anti-regresi: refresh instan onVis visible tetap ada (480 tak menggantinya)', () => {
    expect(src).toMatch(/onVis = \(\) => \{ if \(alive && document\.visibilityState === 'visible'\) \{ clearTimeout\(timer\); tick\(\); schedule\(\) \} \}/)
    expect(src).toMatch(/removeEventListener\('visibilitychange', onVis\)/)
  })

  it('anti-poisoning: gate 471 (interval setConn 5 dtk) & poll adaptif 324 tak diregresi', () => {
    expect(src).toMatch(/const iv = setInterval\(\(\) => \{[\s\S]*?document\.visibilityState === 'hidden'[\s\S]*?\}, 5000\)/)
    expect(src).toMatch(/document\.visibilityState === 'visible' \? nextPollDelay/)
    expect(src).toContain('STALE_AFTER_MS')
  })
})
