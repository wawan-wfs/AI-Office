import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeClipText } from '../lib/clip.js'

// Siklus 559: guard terakhir jalur bulk-confirm ShConsole — scope string-built
// (`${selected?.name} (#${project})`) boleh dioper ke ConfirmModal dalam bentuk
// sah non-string (objek name / id bentuk spesial) tanpa '[object Object]'.

const src = readFileSync(new URL('../components/ShConsole.jsx', import.meta.url), 'utf8')

describe('shconsole_bulk_scope_poison_559', () => {
  it('kontrak normalizeClipText untuk bentuk sah non-string', () => {
    expect(normalizeClipText({ name: 'x' })).toBe('{"name":"x"}')
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(42)).toBe('42')
  })

  it('scope bulk-confirm dibungkus normalizeClipText + child name/project ternormalisasi', () => {
    const line = src.split('\n').find(l => l.includes('const scope ='))
    expect(line).toContain('normalizeClipText(confirmedScope')
    expect(line.match(/normalizeClipText/g).length).toBeGreaterThanOrEqual(3)
  })

  it('anti-regresi: tidak ada interpolasi scope mentah lama', () => {
    expect(src).not.toContain("`${selected?.name || 'Project'} (#${project})`")
  })
})
