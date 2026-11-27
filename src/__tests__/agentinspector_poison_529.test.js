// Siklus 529 — guard anti-poisoning AgentInspector:
// 1) kontrak normalizeClipText satu sumber (null/angka/objek/siklik → string aman)
// 2) sweep regex: tidak ada lagi interpolasi MENTAH agent.name / activeTask.id /
//    nama divisi dalam atribut dinamis (aria-label/title) atau child JSX
// 3) badge lantai memakai SATU sumber `floorBadge` (3 titik render: onClick,
//    title, aria-label — tidak ada ekspresi fallback panjang tersisa)
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeClipText } from '../lib/clip.js'

const SRC = readFileSync(resolve(__dirname, '../components/AgentInspector.jsx'), 'utf8')

describe('normalizeClipText kontrak (clip.js satu sumber)', () => {
  it('menahan bentuk tidak wajar tanpa lempar', () => {
    const cyc = {}; cyc.self = cyc
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
    expect(normalizeClipText(42)).toBe('42')
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText(cyc)).toBe('')
  })
})

describe('AgentInspector tanpa render mentah (sweep regex)', () => {
  it('tidak ada interpolasi agent.name / activeTask.id mentah', () => {
    expect(/\$\{agent\.name\}/.test(SRC)).toBe(false)
    expect(/\{agent\.name\}/.test(SRC)).toBe(false)
    expect(/\{activeTask\.id\}/.test(SRC)).toBe(false)
    expect(/\$\{activeTask\.id\}/.test(SRC)).toBe(false)
    // sisa child/divisi mentah: tidak ada "Papan Kanban (" tanpa normalizer
    expect(/shortName\)\)\s*: ''\}\s*<\/button>/.test(SRC)).toBe(false)
    expect(/normalizeClipText\(findTeamByAgent\(agent\.name\)\.shortName\)/.test(SRC)).toBe(true)
    // nama divisi di title/child harus melewati normalizer
    expect(/divisi \$\{normalizeClipText\(/.test(SRC)).toBe(true)
  })

  it('badge lantai satu sumber floorBadge (3 titik)', () => {
    expect((SRC.match(/floorBadge/g) || []).length).toBeGreaterThanOrEqual(4) // 1 deklarasi + 3 pemakaian
    expect(/Lantai \$\{liveFloor \|\| agent\.floor/.test(SRC)).toBe(false)
    expect(/onFocusFloor\(liveFloor \|\| agent\.floor/.test(SRC)).toBe(false)
  })
})
