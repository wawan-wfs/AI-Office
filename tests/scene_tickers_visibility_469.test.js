// Siklus 469 — tickers repaint painter kanvas scene gerbang visibility.
// Tab hidden tak boleh melakukan repaint sia-sia di interval/timeout painter:
// lounge (connTick 30 dtk + onsiteTick 5 dtk), projectboard (connIv 30 dtk +
// forceVisible 0,5 dtk), room whiteboard (wbIv 60 dtk).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('scene tickers visibility gate (469)', () => {
  it('lounge: connTick & onsiteTick skip saat tab hidden', () => {
    const src = read('src/scene/parts/lounge.js')
    const conn = src.match(/const connTick = setInterval\(\(.*\) => \{(.*)\}, CONN_TICK_MS\)/)
    expect(conn, 'connTick tetap ada').toBeTruthy()
    expect(conn[1]).toContain("document.visibilityState === 'hidden'")
    const onsite = src.match(/const onsiteTick = setInterval\(\(\) => \{([\s\S]*?)\}, 5000\)/)
    expect(onsite, 'onsiteTick tetap ada').toBeTruthy()
    expect(onsite[1]).toContain("document.visibilityState === 'hidden'")
    // anti-poisoning: latch visible-lagi benar (drawTv setelah latch)
    expect(onsite[1]).toContain('__onsitePageHidden')
  })

  it('projectboard: connIv & forceVisible gerbang visibility', () => {
    const src = read('src/scene/parts/projectboard.js')
    const conn = src.match(/const connIv = setInterval\(\(\) => \{(.*)\}, CONN_TICK_MS\)/)
    expect(conn, 'connIv tetap ada').toBeTruthy()
    expect(conn[1]).toContain("document.visibilityState === 'hidden'")
    expect(src).toContain('Siklus 469')
    // Siklus 470: forceVisible interval 500ms DIbuang — latch pasca-visible
    // kini event-driven via onVisLatch (tanpa interval 0,5 dtk).
    expect(src).not.toMatch(/const forceVisible = setInterval\(/)
    expect(src).toContain('onVisLatch')
  })

  it('room: wbIv 60 dtk skip saat hidden', () => {
    const src = read('src/scene/parts/room.js')
    // Siklus 477: gate hidden kini early-return di baris pertama wbTick
    expect(src).toContain("if (document.visibilityState === 'hidden') return;")
    expect(src).toContain('setInterval(wbTick, 60000)')
    // anti-regresi: destroy tetap membersihkan wbIv + listener visibilitas
    expect(src).toContain('clearInterval(wbIv)')
    expect(src).toContain("document.removeEventListener('visibilitychange', wbOnVis)")
  })

  it('tidak ada repaint tick tanpa gerbang visibility di 3 painter', () => {
    for (const p of ['src/scene/parts/lounge.js', 'src/scene/parts/projectboard.js', 'src/scene/parts/room.js']) {
      const src = read(p)
      const ticks = [...src.matchAll(/setInterval\(/g)]
      expect(ticks.length, p + ' punya interval').toBeGreaterThan(0)
      // setiap callback tick yang menyentuh visibilityState harus skip saat hidden
      const unguarded = [...src.matchAll(/setInterval\(\s*\(\)\s*=>\s*\{(?!\s*const hidden|\s*if \(document\.visibilityState)([\s\S]*?)\}, \d+\)/g)]
        .map(m => m[1])
        .filter(body => /visibilityState/.test(body))
      expect(unguarded, p + ': tick visibilityState tanpa gerbang hidden').toEqual([])
    }
  })
})
