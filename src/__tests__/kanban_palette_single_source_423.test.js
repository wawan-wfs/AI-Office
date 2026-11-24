// Siklus 423 — palet kanban satu sumber.
//
// kanban_spec.js (KANBAN_COLUMNS bg, PRIORITY_CONFIG, TAG_PALETTE,
// kontras badge, TAG_PRESETS, ROLE_COLORS, DIVISION_PRESETS, fallback
// divisi, opsi 'Semua' divisi, badge kosong) kini delegasi penuh ke
// lib/ui_palette.js — 0 literal hex/rgba tersisa di kanban_spec.js.
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import {
  KANBAN_COLUMN_BG, KANBAN_PRIORITY_COLORS, KANBAN_PRIORITY_BG,
  KANBAN_TAG_PALETTE, KANBAN_ROLE_COLORS, KANBAN_TAG_PRESET_COLORS,
  KANBAN_DIVISION_COLORS, KANBAN_AUDIT_SURFACE,
} from '../lib/ui_palette.js'
import {
  KANBAN_COLUMNS, PRIORITY_CONFIG, TAG_PALETTE, ROLE_COLORS,
  getTaskPriorityInfo, getTagColor, getTaskRoleBadgeColor,
  getContrastingTextColor, auditBadgeContrast, DIVISION_PRESETS,
} from '../scene/parts/kanban_spec.js'

const KS = 'src/scene/parts/kanban_spec.js'

describe('siklus 423 — palet kanban satu sumber', () => {
  it('nilai historis terkunci di ui_palette', () => {
    expect(KANBAN_COLUMN_BG).toEqual({
      pending: 'rgba(154, 167, 184, 0.12)',
      running: 'rgba(245, 158, 11, 0.12)',
      review: 'rgba(96, 165, 250, 0.12)',
      done: 'rgba(16, 229, 160, 0.12)',
    })
    expect(KANBAN_PRIORITY_COLORS.urgent).toBe('#EF4444')
    expect(KANBAN_PRIORITY_COLORS.high).toBe('#F97316')
    expect(KANBAN_PRIORITY_COLORS.medium).toBe('#EAB308')
    expect(KANBAN_PRIORITY_COLORS.low).toBe('#94A3B8')
    expect(KANBAN_PRIORITY_COLORS.normal).toBe('#64748B')
    expect(KANBAN_PRIORITY_BG.low).toBe('rgba(148, 163, 184, 0.14)')
    expect(KANBAN_TAG_PALETTE[0]).toBe('#38BDF8')
    expect(KANBAN_TAG_PALETTE).toHaveLength(11)
    expect(KANBAN_ROLE_COLORS.be).toBe('#3B82F6')
    expect(KANBAN_ROLE_COLORS.sre).toBe('#F97316')
    expect(KANBAN_TAG_PRESET_COLORS.fullstack).toBe('#60A5FA')
    expect(KANBAN_DIVISION_COLORS['product-cs']).toBe('#F59E0B')
    expect(KANBAN_AUDIT_SURFACE).toBe('#151d2e')
  })

  it('kanban_spec delegasi penuh ke palet', () => {
    for (const col of KANBAN_COLUMNS) {
      expect(col.bg).toBe(KANBAN_COLUMN_BG[col.key])
    }
    expect(PRIORITY_CONFIG.urgent.color).toBe(KANBAN_PRIORITY_COLORS.urgent)
    expect(PRIORITY_CONFIG.high.bg).toBe(KANBAN_PRIORITY_BG.high)
    expect(getTaskPriorityInfo('mystery').color).toBe(KANBAN_PRIORITY_COLORS.normal)
    expect(TAG_PALETTE).toBe(KANBAN_TAG_PALETTE)
    expect(ROLE_COLORS).toBe(KANBAN_ROLE_COLORS)
    expect(getTaskRoleBadgeColor('nope')).toBe(KANBAN_PRIORITY_COLORS.normal)
    expect(getTagColor('')).toBe(KANBAN_PRIORITY_COLORS.normal)
    for (const p of DIVISION_PRESETS) {
      expect(p.color).toBe(KANBAN_DIVISION_COLORS[p.key])
    }
  })

  it('kontras badge & teks pakai konstanta (nilai identik)', () => {
    expect(getContrastingTextColor('#FBBF24')).toBe('#0b1320')
    expect(getContrastingTextColor('#3B82F6')).toBe('#0b1320')
    const a = auditBadgeContrast('#FBBF24')
    expect(a.bestTextColor).toBe('#0b1320')
    expect(a.contrastOnSurface).toBe(auditBadgeContrast('#FBBF24', KANBAN_AUDIT_SURFACE).contrastOnSurface)
  })

  it('0 literal hex/rgba tersisa di kanban_spec.js', async () => {
    const src = readFileSync(new URL(`../../${KS}`, import.meta.url), 'utf8')
    expect(src).not.toMatch(/'#[0-9a-fA-F]{3,8}'/)
    expect(src).not.toMatch(/'rgba?\(/)
    expect(src).toContain("from '../../lib/ui_palette.js'")
  })
})
