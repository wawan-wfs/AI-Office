// Siklus 536 — guard kontrak data agen (anti-poisoning warna identitas).
// agent.hex dipakai langsung di CSS (AgentInspector `${agent.hex}44`) dan
// nameplate bubble scene. Bila nama agen tidak terdaftar di AGENT_ID_COLORS,
// hex = undefined → CSS "undefined44" / [object Object]. Kontrak: SEMUA agen
// (AGENTS + AGENTS_EXTRA + EXTENDED_SPECIALISTS) wajib punya hex string
// '#RRGGBB' valid dan color numerik konvergen.
import { describe, it, expect } from 'vitest'
import { AGENTS, AGENTS_EXTRA } from '../scene/parts/agents_spec.js'
import { EXTENDED_SPECIALISTS } from '../scene/parts/extended_desks.js'
import { AGENT_ID_COLORS } from '../lib/ui_palette.js'

const HEX_RE = /^#[0-9A-Fa-f]{6}$/
const all = [...AGENTS, ...AGENTS_EXTRA, ...EXTENDED_SPECIALISTS]

describe('agent data color contract (536)', () => {
  it('setiap agen punya hex string #RRGGBB valid (bukan undefined)', () => {
    const bad = all.filter(a => !HEX_RE.test(a.hex || ''))
    expect(bad.map(a => a.name)).toEqual([])
  })

  it('setiap agen punya color numerik (hasil agentColorFromHex)', () => {
    const bad = all.filter(a => typeof a.color !== 'number' || Number.isNaN(a.color))
    expect(bad.map(a => a.name)).toEqual([])
  })

  it('AGENT_ID_COLORS hanya berisi hex valid dan semua nama agen terdaftar', () => {
    for (const [name, hex] of Object.entries(AGENT_ID_COLORS)) {
      expect(HEX_RE.test(hex), name).toBe(true)
    }
    const missing = all.filter(a => !(a.name in AGENT_ID_COLORS))
    expect(missing.map(a => a.name)).toEqual([])
  })
})
