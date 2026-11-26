import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Siklus 498 — guard lock reentrancy ShConsole POST tanpa lock ref:
// decideApproval (POST approvals/{id}/decide), commitWs (POST git/commit),
// sbAction (POST sandbox/{action}) — dobel klik cepat sebelum re-render
// mengirim POST kedua. Pola lock ref konsisten 490–497.
const src = readFileSync(resolve(__dirname, '../components/ShConsole.jsx'), 'utf8')

describe('siklus 498 — lock reentrancy POST ShConsole tanpa lock (approval/git/sandbox)', () => {
  it('1. tiga lock ref dideklarasikan (bukan state)', () => {
    expect(src).toMatch(/const approvalInFlight = useRef\(false\)/)
    expect(src).toMatch(/const gitInFlight = useRef\(false\)/)
    expect(src).toMatch(/const sbInFlight = useRef\(false\)/)
  })

  it('2. guard cek+set SEBELUM POST di tiap fungsi', () => {
    for (const [fn, ref, api] of [
      ['decideApproval', 'approvalInFlight', "api('approvals/' + aid + '/decide'"],
      ['commitWs', 'gitInFlight', "api('projects/' + pid + '/git/commit'"],
      ['sbAction', 'sbInFlight', "api('projects/' + pid + '/sandbox/'"],
    ]) {
      const g = src.indexOf(`if (${ref}.current) return`)
      const s = src.indexOf(`${ref}.current = true`)
      const p = src.indexOf(api, s)
      expect(g, 'guard ' + fn).toBeGreaterThan(-1)
      expect(s, 'set ' + fn).toBeGreaterThan(g)
      expect(p, 'POST ' + fn).toBeGreaterThan(s)
    }
  })

  it('3. lock dilepas di finally (semua jalur termasuk error)', () => {
    for (const ref of ['approvalInFlight', 'gitInFlight', 'sbInFlight']) {
      const s2 = src.indexOf(`${ref}.current = true`)
      const post = src.indexOf(`await api(`, s2)
      const fin = src.indexOf('finally {', post)
      expect(src.indexOf(`${ref}.current = false`, fin), ref).toBeGreaterThan(fin)
    }
  })

  it('4. kontrak lama tak diregresi: rid per-surface, lock 490/491 + runInFlight Set', () => {
    expect(src).toMatch(/const guardAct = \(k, rid\) => actRid\.current\[k\] === rid/)
    expect(src).toMatch(/if \(taskInFlight\.current\) return/)
    expect(src).toMatch(/if \(projectInFlight\.current\) return/)
    expect(src).toMatch(/runInFlight\.current\.has\(tid\)/)
    expect(src).toMatch(/bulkInFlight\.current/)
  })
})
