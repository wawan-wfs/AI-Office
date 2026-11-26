/* Siklus 486: higiene pasangan add/removeEventListener scene.
 * Sensus otomatis (regex add/removeEventListener per file sumber non-test)
 * menemukan satu-satunya ketidakseimbangan: destroy() OfficeScene melepas
 * keydown/pointerdown __ensureAudio yang TIDAK PERNAH dipasang — sisa
 * refaktor lama (listener wake audio kini dikelola installAudioWake dengan
 * dispose sendiri, siklus 57). Dead removal menyesatkan pembaca & rawan
 * menyembunyikan leak nyata. Guard: 0 dead removal, pasangan keydown scene
 * (onKey, __onOrbitKey) tetap berpasangan. */
import { describe, it, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const src = readFileSync(path.resolve(__dirname, '../scene/OfficeScene.js'), 'utf8')

describe('listener pair hygiene 486', () => {
  test('destroy tidak melepas __ensureAudio yang tak pernah dipasang', () => {
    expect(src).not.toMatch(/removeEventListener\('keydown',\s*__ensureAudio\)/)
    expect(src).not.toMatch(/removeEventListener\('pointerdown',\s*__ensureAudio\)/)
  })

  test('pasangan keydown scene onKey & __onOrbitKey berpasangan add=rm', () => {
    const add = (src.match(/addEventListener\('keydown',\s*(onKey|__onOrbitKey)\)/g) || []).length
    const rm = (src.match(/removeEventListener\('keydown',\s*(onKey|__onOrbitKey)\)/g) || []).length
    expect(add).toBe(2)
    expect(rm).toBe(2)
  })

  test('sensus pasangan listener window scene: 0 ketidakseimbangan', () => {
    const from = (src.match(/addEventListener\('(\w+)'/g) || []).map(s => s.match(/'(\w+)'/)[1])
    const to = (src.match(/removeEventListener\('(\w+)'/g) || []).map(s => s.match(/'(\w+)'/)[1])
    const count = (a) => a.reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {})
    const ca = count(from), cr = count(to)
    const unbalanced = [...new Set([...Object.keys(ca), ...Object.keys(cr)])]
      .filter(k => (ca[k] || 0) !== (cr[k] || 0))
    expect(unbalanced).toEqual([])
  })

  test('kontrak 57: dispose wake audio tetap dipanggil di destroy', () => {
    expect(src).toMatch(/__disposeAudioWake\s*&&\s*__disposeAudioWake\(\)/)
  })
})
