// Guard siklus 484: timer toast App.jsx (toastTimer, delay 3500) di-clear saat
// unmount — anti setToast komponen gugur pasca-unmount (pola higiene 482/483).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', '..', p), 'utf8')

describe('toast timer App di-clear saat unmount (484)', () => {
  const src = read('src/App.jsx')

  it('cleanup unmount meng-clear toastTimer.current', () => {
    expect(src).toMatch(/useEffect\(\(\) => \(\) => \{ clearTimeout\(toastTimer\.current\) \}, \[\]\)/)
  })

  it('flash tetap set timer dgn delay 3500 terkunci (perilaku tampilan tak berubah)', () => {
    expect(src).toMatch(/toastTimer\.current = setTimeout\(\(\) => setToast\(null\), 3500\)/)
    expect(src).toMatch(/clearTimeout\(toastTimer\.current\)\n    toastTimer\.current = setTimeout/)
  })

  it('anti-duplikat: hanya SATU effect cleanup unmount utk toastTimer', () => {
    const hits = [...src.matchAll(/useEffect\(\(\) => \(\) => \{ clearTimeout\(toastTimer\.current\) \}, \[\]\)/g)]
    expect(hits.length).toBe(1)
  })

  it('anti-poisoning: scheduler poll (480) & interval conn (471) tetap punya cleanup sendiri', () => {
    expect(src).toMatch(/clearTimeout\(timer\)\n      clearInterval\(iv\)/)
    expect(src).not.toMatch(/clearInterval\(toastTimer\.current\)/)
  })
})
