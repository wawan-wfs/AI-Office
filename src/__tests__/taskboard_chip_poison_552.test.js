import { describe, it, expect } from 'vitest'
import { normalizeClipText } from '../lib/clip'
import { readFileSync } from 'fs'
import { join } from 'path'

// Siklus 552: guard anti-poisoning chip TaskBoard — label divisi/preset/
// tag/kolom kanban tidak boleh dirender mentah sebagai child JSX
// (objek bentuk sah → "[object Object]").

describe('normalizeClipText kontrak', () => {
  it('objek → string aman, string tetap', () => {
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText('ok')).toBe('ok')
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
    expect(normalizeClipText(42)).toBe('42')
  })
})

describe('TaskBoard.jsx chip label tanpa interpolasi mentah', () => {
  const src = readFileSync(join(__dirname, '..', 'components', 'TaskBoard.jsx'), 'utf8')

  it('child chip label dibungkus normalizeClipText', () => {
    const bad = [
      /<span className="div-chip-label">\{div\.label\}<\/span>/,
      /<span className="div-preset-label">\{preset\.label\}<\/span>/,
      /<span className="div-preset-label">\{p\.label\}<\/span>/,
      /<span className="task-tag-chip-name">\{item\.label\}<\/span>/,
      /<span className="task-preset-label">\{p\.label\}<\/span>/,
      /<span className="kanban-col-title">\{col\.label\}<\/span>/,
      /<span>\{col\.label\}<\/span>/,
    ]
    for (const re of bad) expect(src).not.toMatch(re)
    expect(src.match(/normalizeClipText\(/g).length).toBeGreaterThanOrEqual(10)
  })

  it('flash preset memakai normPresetLabel', () => {
    expect(src).not.toMatch(/onFlash\(`Preset kustom "\$\{newPreset\.label\}/)
    expect(src).not.toMatch(/onFlash\(`Preset divisi kustom "\$\{newPreset\.label\}/)
    expect(src).toMatch(/normPresetLabel\(/)
  })
})
