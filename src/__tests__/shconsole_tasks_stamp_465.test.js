// Siklus 465 — stempel waktu task di tab Tasks ShConsole satu-sumber kanban_date.
// UI ShConsole kini melukis formatTaskDate(task); parser/anti-poisoning inti
// sudah diguard kanban_date.test.js & month_single_source_342.test.js — tes ini
// mengunci KONTRAK ShConsole: memakai satu sumber, fallback '—' utk task tanpa stempel.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { formatTaskDate } from '../../src/lib/kanban_date'

const ROOT = resolve(__dirname, '../..')
const src = readFileSync(resolve(ROOT, 'src/components/ShConsole.jsx'), 'utf8')

describe('shconsole_tasks_stamp_465', () => {
  it('ShConsole mengimpor formatTaskDate dari kanban_date (satu sumber)', () => {
    expect(src).toMatch(/import\s*\{\s*formatTaskDate\s*\}\s*from\s*'\.\.\/lib\/kanban_date'/)
  })

  it('baris task memakai formatTaskDate (dilukis di tab Tasks)', () => {
    expect(src).toMatch(/formatTaskDate\(t\)/)
    expect(src).not.toMatch(/new Date\(\s*t\.created/ ) // tanpa parser inline
  })

  it('fallback parser inti: task tanpa stempel → "—" (tanpa Invalid Date)', () => {
    expect(formatTaskDate({})).toBe('—')
    expect(formatTaskDate(null)).toBe('—')
    expect(formatTaskDate({ created_at: NaN })).toBe('—')
    expect(formatTaskDate({ created_at: 'invalid' })).toBe('—')
  })

  it('detik-UNIX REAL backend diparsing eksak (regresi satuan)', () => {
    // tasks.db created REAL detik (mis. 1793736898.24) → "Hari ini, HH:MM" bila hari ini
    const now = new Date(1793736898.24 * 1000)
    const d = formatTaskDate({ created_at: 1793736898.24 }, { now: now.getTime() })
    expect(d).toBe('Hari ini, ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'))
  })
})
