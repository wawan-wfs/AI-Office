// Siklus 473 — tick poll SW update (interval pollMs 10 dtk) di-gerbang
// visibility. Dulu tick tetap jalan di tab hidden (banner tak terlihat) —
// paritas gerbang tick 469-472. Event statechange/updatefound tetap menutup
// poll lebih awal; dispose tetap membersihkan interval.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('sw update poll visibility (473)', () => {
  const src = read('src/lib/sw_update.js')

  it('tick interval poll di-gerbang hidden (skip saat visibilityState hidden)', () => {
    const block = src.match(/pollTimer = setInterval\(([\s\S]*?)\}, pollMs\)/)
    expect(block, 'interval poll tetap ada').toBeTruthy()
    expect(block[1]).toContain("document.visibilityState === 'hidden'")
    expect(block[1]).toContain('return')
    // gate diuji SEBELUM checkWaiting (early return tanpa kerja)
    expect(block[1].indexOf('visibilityState')).toBeLessThan(block[1].indexOf('checkWaiting()'))
  })

  it('anti-regresi: gate tidak mematikan jalur event statechange/updatefound', () => {
    expect(src).toContain("addEventListener('statechange', onStateChange)")
    expect(src).toContain("addEventListener('updatefound', onUpdateFound)")
    expect(src).toContain('if (checkWaiting()) clearInterval(pollTimer)')
  })

  it('anti-poisoning: guard 192 tidak diregresi (poll waiting eksplisit + wasControlled + dispose)', () => {
    expect(src).toContain('reg.waiting &&')
    expect(src).toContain('wasControlled')
    expect(src).toContain('clearInterval(pollTimer)')
    expect(src).toContain("removeEventListener('controllerchange', onControllerChange)")
  })

  it('kontrak 192 utuh: interval tetap satu jalur lapis kedua (bukan pengganti event)', () => {
    // poll hanya dipasang bila event belum menemukan waiting saat mount
    expect(src).toContain('if (pollMs > 0 && !checkWaiting())')
  })
})
