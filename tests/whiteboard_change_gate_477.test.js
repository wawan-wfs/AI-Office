// Siklus 477 — tick whiteboard ruang rapat hanya redraw bila data berubah.
// Dulu wbTick (60 dtk) memanggil redraw() TANPA syarat tiap tick: kanvas
// 320×128 digambar ulang + board.material.map.needsUpdate (upload tekstur GPU)
// walau window.__tvData.tasks tak berubah (pull di-skip saat tab hidden /
// backoff kesehatan → tidak ada data baru). Kini tick menggambar hanya bila
// referensi tasks berbeda dari gambar terakhir (paritas drawIfHostChanged
// papan proyek & onsiteTick lounge); gerbang visibility 469 dipertahankan;
// redraw() publik (onVis / boardRedraw) tetap menggambar penuh.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('whiteboard tick change-gate (477)', () => {
  const room = read('src/scene/parts/room.js')

  it('wbTick menggambar hanya bila referensi tasks berubah (skip data identik)', () => {
    expect(room).toContain('const wbTick = () => {')
    expect(room).toContain('if (data === __wbLastData) return')
    // gate dievaluasi SEBELUM pemanggilan redraw di dalam wbTick
    const gateIdx = room.indexOf('if (data === __wbLastData) return')
    const tickBodyStart = room.indexOf('const wbTick = () => {')
    const tickBodyEnd = room.indexOf('};', room.indexOf('redraw();', tickBodyStart))
    expect(gateIdx).toBeGreaterThan(tickBodyStart)
    expect(gateIdx).toBeLessThan(tickBodyEnd)
  })

  it('redraw mencatat basis data tick — redraw publik tetap menggambar penuh', () => {
    expect(room).toContain('let __wbLastData')
    // basis dicatat DI DALAM redraw (setelah gambar) — semua jalur redraw sinkron
    const redrawStart = room.indexOf('const redraw = () => {')
    const redrawEnd = room.indexOf('};', redrawStart)
    const basisIdx = room.indexOf('__wbLastData = typeof window', redrawStart)
    expect(basisIdx).toBeGreaterThan(redrawStart)
    expect(basisIdx).toBeLessThan(redrawEnd)
    // redraw() publik tetap dipanggil penuh dari onVis (pasca-visible)
    expect(room).toContain('const wbOnVis = () => { if (document.visibilityState === \'visible\') redraw() }')
  })

  it('anti-regresi: gerbang visibility 469 dipertahankan di wbTick', () => {
    const tickStart = room.indexOf('const wbTick = () => {')
    const tickEnd = room.indexOf('const wbIv', tickStart)
    const body = room.slice(tickStart, tickEnd)
    expect(body).toContain("document.visibilityState === 'hidden'")
    // interval 60 dtk tunggal tetap ada (tidak digandakan)
    expect(room.match(/setInterval\(wbTick, 60000\)/g)?.length).toBe(1)
  })

  it('anti-poisoning: kontrak destroy & pembanding data tidak dibuang', () => {
    expect(room).toContain('clearInterval(wbIv)')
    expect(room).toContain("document.removeEventListener('visibilitychange', wbOnVis)")
    // pembanding memakai referensi (===) — bukan JSON.stringify per-tick (CPU sia-sia)
    expect(room).not.toContain("JSON.stringify(window.__tvData")
  })
})
