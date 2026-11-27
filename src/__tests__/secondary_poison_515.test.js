// Siklus 515: field sekunder agent/approval non-string (bentuk sah API:
// numerik/objek/array) harus dinormalisasi sebelum dirender sebagai React
// child — melengkapi sweep 512 (TaskBoard), 513 (TeamStats/Dashboard/ShConsole
// task), 514 (fokus agen + aria Dashboard). Titik baru: ShConsole tab agents
// & approvals, AgentInspector header (name/role).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (p) => readFileSync(resolve(__dirname, p), 'utf8')

describe('siklus 515 — render field sekunder agent dinormalisasi', () => {
  const sc = read('../components/ShConsole.jsx')
  const ai = read('../components/AgentInspector.jsx')

  it('ShConsole tab agents membungkus role/model/status', () => {
    expect(sc).toMatch(/normalizeSecondary\(a\.role\)/)
    expect(sc).toMatch(/normalizeSecondary\(a\.model\)/)
    expect(sc).toMatch(/normalizeSecondary\(a\.status\)/)
  })

  it('ShConsole approvals membungkus action_type/description', () => {
    expect(sc).toMatch(/normalizeSecondary\(a\.action_type\)/)
    expect(sc).toMatch(/normalizeSecondary\(a\.description\)/)
  })

  it('AgentInspector header membungkus name/role', () => {
    expect(ai).toMatch(/normalizeSecondary\(agent\.name\)/)
    expect(ai).toMatch(/normalizeSecondary\(agent\.role\)/)
  })

  it('tidak ada sisa React child mentah di titik yang sudah dibungkus', () => {
    expect(sc).not.toMatch(/\{a\.role\}/)
    expect(sc).not.toMatch(/\{a\.model\}/)
    expect(sc).not.toMatch(/\{a\.status \|\| 'idle'\}/)
    expect(sc).not.toMatch(/\{a\.description\}/)
    expect(ai).not.toMatch(/\{agent\.role \|\| 'AI Specialist'\}/)
  })

  it('kontrak normalizeSecondary AgentInspector: null/angka/objek/siklik', () => {
    // evaluasi helper yang sama (sumber: teks file, agar kontrak terkunci)
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      'JSON',
      'return (' + ai.match(/const normalizeSecondary = \(v\) => \{[\s\S]*?\n\}/)[0].replace('const normalizeSecondary = ', '') + ')'
    )
    const f = fn(JSON)
    const cyclic = {}; cyclic.self = cyclic
    expect(f(null)).toBe('')
    expect(f(undefined)).toBe('')
    expect(f('')).toBe('')
    expect(f('role x')).toBe('role x')
    expect(f(7)).toBe('7')
    expect(f(true)).toBe('true')
    expect(f({ a: 1 })).toBe('{"a":1}')
    expect(f([1, 2])).toBe('[1,2]')
    expect(f(cyclic)).toBe('')
  })
})
