import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as palette from '../lib/ui_palette.js'

const FILES = [
  'src/components/TaskBoard.jsx',
  'src/components/SettingsModal.jsx',
  'src/components/AgentInspector.jsx',
  'src/components/TeamStats.jsx',
  'src/components/ProjectPanel.jsx',
  'src/components/CsWidget.jsx',
  'src/components/Dashboard.jsx',
]

describe('siklus 408 — komponen React bebas hex literal', () => {
  it('7 komponen tanpa literal warna hex', () => {
    for (const f of FILES) {
      const src = readFileSync(resolve(__dirname, '..', '..', f), 'utf8')
      expect(src.match(/#[0-9a-fA-F]{6}\b/g), f).toBeNull()
    }
  })

  it('8 konstanta siklus 408 ada di ui_palette', () => {
    for (const k of ['PANEL_SOFT_TEXT','NOTE_TEXT','ITEM_TITLE_TEXT','CHIP_TEXT','AVATAR_TEXT','CS_HEADER_BG','GOLD_ACCENT','IDLE_DOT']) {
      expect(palette[k], k).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('tidak ada konstanta duplikat nilai di palette', () => {
    // konstanta scene numerik (SCENE_*/FURN_*/DUCT_*/TUBE_/LEAD_MON_BODY/HELMET_/
    // RING_BLUE/PARTICLE_WHITE, siklus 424-426) menyimpan nilai 0x… numerik atau
    // hex non-UI — dikecualikan dari cek duplikasi UI.
    const EXCLUDE = /^(SCENE_|FURN_|DUCT_|TUBE_NEON|LEAD_MON_|HELMET_|RING_BLUE|PARTICLE_WHITE|RC_FOUNDER_HEX|RC_FOUNDER_FALLBACK_HEX)/
    const vals = Object.entries(palette).filter(([k,v]) => !EXCLUDE.test(k) && k === k.toUpperCase() && typeof v === 'string' && v.startsWith('#'))
    const seen = new Map()
    for (const [k,v] of vals) {
      expect(seen.has(v), `${k} duplikat ${seen.get(v)}`).toBe(false)
      seen.set(v,k)
    }
  })
})
