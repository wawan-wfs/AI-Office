// Siklus 523 — ANTI-POISONING sisa method-call pada agent.name di
// AgentInspector: avatar inisial `agent.name.slice(0,2)` (TypeError bila
// name bentuk sah non-string: angka/objek dari gateway) dan tombol chat
// `agent.name.split(' ')[0]`. Kini via normalizeSecondary satu sumber
// (lib/clip.js) — konsisten siklus 512-522.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(__dirname, '../..')
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8')

describe('siklus 523 — AgentInspector method-call dinormalisasi', () => {
  it('avatar inisial tidak lagi memanggil .slice mentah pada agent.name', () => {
    const src = read('src/components/AgentInspector.jsx')
    expect(src).not.toMatch(/agent\.name\.slice\(/)
    expect(src).toMatch(/normalizeSecondary\(String\(agent\.name\)\.slice\(0, 2\)\)/)
  })

  it('tombol chat tidak lagi memanggil .split mentah pada agent.name', () => {
    const src = read('src/components/AgentInspector.jsx')
    expect(src).not.toMatch(/agent\.name\.split\(/)
    expect(src).toMatch(/normalizeSecondary\(agent\.name\)\.split\(' '\)/)
  })
})
