// Siklus 479 — layar lobi repaint juga saat hitungan agen on-site berubah.
// Dulu kunci repaint hanya menit-sim (lobbyScreenKey): agen berangkat makan
// siang/pulang (state → 'offsite') baru tampil di layar resepsionis pada ganti
// menit berikutnya (beda hingga 60 dtk vs lobbyOnsiteCount). Kini kunci gabungan
// menit-sim + hitungan on-site; jalur 528 (agents ?? total) tak diregresi.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '../..', p), 'utf8')

describe('lobby screen onsite-count repaint gate (479)', () => {
  const scene = read('src/scene/OfficeScene.js')

  it('kunci repaint gabungan: menit-sim ATAU hitungan on-site berubah', () => {
    expect(scene).toContain('let __lobbyOnsiteLast=null')
    expect(scene).toContain('if(lk!==__lobbyKeyLast||on!==__lobbyOnsiteLast)')
    // gate gabungan dievaluasi SEBELUM drawLobbyScreen
    const gateIdx = scene.indexOf('if(lk!==__lobbyKeyLast||on!==__lobbyOnsiteLast)')
    const drawIdx = scene.indexOf('drawLobbyScreen(__lobbyCtx,')
    expect(gateIdx).toBeGreaterThan(0)
    expect(drawIdx).toBeGreaterThan(gateIdx)
  })

  it('hitungan on-site dihitung sekali per frame via lobbyOnsiteCount (satu sumber 528)', () => {
    expect(scene).toContain('const on=lobbyOnsiteCount(agentData)')
    // nilai yang dipakai painter = hitungan yang sama dgn kunci (?? fallback 528 utuh)
    expect(scene).toContain('agents:on??agentData.length')
    // import lobbyOnsiteCount tetap ada
    expect(scene).toMatch(/import \{[^}]*lobbyOnsiteCount[^}]*\} from '\.\/parts\/lobby_screen\.js'/)
    // fallback total terdaftar tetap ada di argumen painter (kompat 528)
    expect(scene).toContain('??agentData.length')
  })

  it('anti-poisoning: kunci menit-sim lama (lobbyScreenKey) tetap dijaga — tak diregresi 525', () => {
    expect(scene).toContain('let __lobbyKeyLast=null')
    expect(scene).toContain('const lk=lobbyScreenKey(timeOfDay)')
    // needsUpdate tekstur tetap di-set setelah repaint
    const drawIdx = scene.indexOf('drawLobbyScreen(__lobbyCtx,')
    const updIdx = scene.indexOf('__lobbyTex.needsUpdate=true', drawIdx)
    expect(updIdx).toBeGreaterThan(drawIdx)
  })

  it('lobbyOnsiteCount murni menghitung non-offsite (paritas pola 528)', async () => {
    const mod = await import('../scene/parts/lobby_screen.js')
    const data = [{ state: 'sitting' }, { state: 'walking_out' }, { state: 'offsite' }, null]
    expect(mod.lobbyOnsiteCount(data)).toBe(2) // offsite & null dikecualikan
    expect(mod.lobbyOnsiteCount(null)).toBe(null)
  })
})
