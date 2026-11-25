// Siklus 471 — interval setConn 5 dtk di App.jsx di-gerbang visibility.
// Dulu tick label umur koneksi jalan walau tab hidden → re-render React sia-sia
// 12×/menit di latar (label tak terlihat). Paritas gerbang tickers scene 469/470.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('app conn-age tick visibility gate (471)', () => {
  const src = read('src/App.jsx')

  it('interval setConn 5 dtk skip saat tab hidden', () => {
    const iv = src.match(/const iv = setInterval\(\(\) => \{([\s\S]*?)\}, 5000\)/)
    expect(iv, 'interval setConn tetap ada').toBeTruthy()
    expect(iv[1]).toContain("document.visibilityState === 'hidden'")
    expect(iv[1]).toContain('setConn')
  })

  it('anti-poisoning: tick TIDAK memicu fetch (refreshStatus tetap di jalur poll adaptif)', () => {
    const iv = src.match(/const iv = setInterval\(\(\) => \{([\s\S]*?)\}, 5000\)/)
    expect(iv[1]).not.toContain('refreshStatus')
  })

  it('cleanup tetap membersihkan interval + listener visibilitychange', () => {
    expect(src).toContain('clearInterval(iv)')
    expect(src).toMatch(/removeEventListener\('visibilitychange', onVis\)/)
  })

  it('poll adaptif tetap gerbang visibility via scheduler STALE_AFTER_MS (tidak diregresi)', () => {
    expect(src).toMatch(/document\.visibilityState === 'visible' \? nextPollDelay/)
    expect(src).toContain('STALE_AFTER_MS')
  })
})
