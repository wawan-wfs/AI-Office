// Siklus 474 — scan pasangan obrolan (checkConversations) di-throttle 1×/dtk.
// Dulu scan O(n²) jalan TIAP FRAME (~60×/dtk) padahal hasilnya bubble sekali
// per cooldown 8 dtk per agen. Gate WAKTU-NYATA (CHAT_SCAN_SEC=1) — paritas
// kontrak gate waktu 482-486; cooldown agen tetap di-tick per frame dgn delta
// detik nyata (tak diregresi).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const read = (p) => readFileSync(resolve(__dirname, '..', p), 'utf8')

describe('chat scan time gate (474)', () => {
  const scene = read('src/scene/OfficeScene.js')
  const effects = read('src/scene/parts/effects.js')

  it('konstanta gate 1 detik + factory chatTimeGate di effects.js', () => {
    expect(effects).toContain('export const CHAT_SCAN_SEC = 1')
    expect(effects).toContain('export function chatTimeGate() { return makeTimeGate(CHAT_SCAN_SEC); }')
  })

  it('checkConversations di-gerbang gate waktu sebelum scan (early return)', () => {
    expect(scene).toContain('let __chatGate=chatTimeGate()')
    expect(scene).toContain('if(!__chatGate(timer.getElapsed()))return;')
    // gate dievaluasi SEBELUM pemanggilan scan di checkConversations (baris 1818)
    const gateIdx = scene.indexOf("if(!__chatGate(timer.getElapsed()))return;")
    const scanIdx = scene.indexOf('const pairs=nearbyPairsPure(')
    expect(gateIdx).toBeGreaterThan(0)
    expect(scanIdx).toBeGreaterThan(0)
    expect(gateIdx).toBeLessThan(scanIdx)
  })

  it('anti-poisoning: kontrak waktu-nyata chat tak diregresi (delta detik, bukan per-frame)', () => {
    expect(scene).toContain('tickCooldownPure(a._chatCooldown,deltaFrame)')
    expect(scene).toContain("from './parts/chat_check.js'")
    // gate memakai elapsed detik nyata dari Timer — bukan frame-count
    expect(scene).toContain('timer.getElapsed()')
  })

  it('anti-regresi: gate waktu lain (bubble/dust/ambient) tidak digantikan chatGate', () => {
    expect(scene).toContain('__bubbleGate(elapsed)')
    expect(scene).toContain('__dustGate')
    expect(scene).toContain('__ambientGate(elapsed)')
    // import tetap memuat bubble & chat gate keduanya
    const imp = scene.match(/import \{[^}]*bubbleTimeGate[^}]*\} from '\.\/parts\/effects\.js'/)
    expect(imp, 'import effects utuh').toBeTruthy()
    expect(imp[0]).toContain('chatTimeGate')
  })
})
