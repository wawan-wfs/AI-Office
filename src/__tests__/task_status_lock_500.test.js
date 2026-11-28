// Siklus 500 — lock reentrancy PATCH status TaskBoard (handleMoveTask).
// PATCH tasks/{id}/status BERBAYAR (approval-gate paritas run): dobel drop /
// pointerup cepat pada kartu yang sama TIDAK boleh mengirim PATCH kedua.
// Pola konsisten lock ref 490–498; fitur kanban & flash gagal tak diregresi.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../components/TaskBoard.jsx'), 'utf8')

describe('siklus 500 — statusInFlight lock PATCH status TaskBoard', () => {
  it('lock ref Set per-task ada di komponen (bukan state)', () => {
    expect(src).toMatch(/const statusInFlight = useRef\(new Set\(\)\)/)
    expect(src).not.toMatch(/useState.*statusInFlight/)
  })

  it('guard cek+set SEBELUM PATCH, dilepas di finally', () => {
    // urutan: guard → add → api → finally delete
    const guardIdx = src.indexOf('if (statusInFlight.current.has(task.id)) return')
    const addIdx = src.indexOf('statusInFlight.current = new Set(statusInFlight.current).add(task.id)')
    const apiIdx = src.indexOf("api(`tasks/${task.id}/status`")
    const finIdx = src.indexOf("statusInFlight.current.delete(task.id)")
    expect(guardIdx).toBeGreaterThan(-1)
    expect(addIdx).toBeGreaterThan(guardIdx)
    expect(apiIdx).toBeGreaterThan(addIdx)
    expect(finIdx).toBeGreaterThan(apiIdx)
    // pelepasan ada di blok finally
    expect(src.slice(apiIdx, src.length)).toMatch(/\.finally\(\(\) => \{[\s\S]*statusInFlight\.current\.delete/)
  })

  it('PATCH tetap satu sumber dan flash gagal jujur (kontrak 235 tak diregresi)', () => {
    expect((src.match(/api\(`tasks\/\$\{task\.id\}\/status`/g) || []).length).toBe(1)
    expect(src).toMatch(/method: 'PATCH', body: \{ status: persistedStatus \}/)
    expect(src).toMatch(/Gagal memindahkan task #\$\{normalizeClipText\(task\.id\)\}/)
    // failed→review tetap failed (bukan dipetakan)
    expect(src).toMatch(/task\.status === 'failed' && targetColKey === 'review' \? 'failed' : targetColKey/)
  })

  it('optimis state & sfx drop tetap berjalan (bukan digantung oleh lock)', () => {
    expect(src).toMatch(/moveTaskToColumn\(prev, task\.id, targetColKey\)/)
    expect(src).toMatch(/playDropFor\(\{ status: targetColKey/)
  })
})
