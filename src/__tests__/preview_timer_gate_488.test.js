import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Siklus 488 — guard timer preview ambience: previewAmbience yang diulang
// menimpa previewTimer dgn clearTimeout timer lama + callback di-gerbangi
// kepemilikan timer (anti timer basi menghentikan ambience lebih awal).
const src = readFileSync(resolve(__dirname, '../scene/parts/sound_engine.js'), 'utf8')

describe('siklus 488 — timer preview ambience dilacak & digerbangi', () => {
  it('1. preview ulang meng-clear previewTimer lama sebelum menimpa', () => {
    expect(src).toMatch(
      /if \(ambienceNodes\.previewTimer\) \{\s*\n\s*clearTimeoutFn\(ambienceNodes\.previewTimer\);?\s*\n\s*ambienceNodes\.previewTimer = null;?\s*\n\s*\}\s*\n\s*ambienceNodes\.previewTimer = timer;/
    )
  })

  it('2. callback preview di-gerbangi kepemilikan timer (anti timer basi)', () => {
    expect(src).toMatch(/if \(ambienceNodes && ambienceNodes\.previewTimer === timer\) \{/)
    expect(src).not.toMatch(/const timer = setTimeoutFn\(\(\) => \{\s*\n\s*if \(ambienceNodes\) \{/)
  })

  it('3. perilaku inti tak diregresi: ramp-down 483 + dispose pending tetap utuh', () => {
    expect(src).toMatch(/const cleanupTimer = setTimeoutFn\(/) // guard 483
    expect(src).toMatch(/pending\.push\(cleanupTimer\)/)
    expect(src).toMatch(/pending\.forEach\(clearTimeoutFn\)/)
    expect(src).toMatch(/pending\.length = 0/)
  })

  it('4. delay preview terkunci (Math.max(100, durationSec*1000))', () => {
    expect(src).toMatch(/Math\.max\(100, Math\.floor\(durationSec \* 1000\)\)/)
  })
})
