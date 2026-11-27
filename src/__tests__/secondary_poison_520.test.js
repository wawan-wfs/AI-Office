import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const src = readFileSync(path.join(here, '..', 'components', 'ShConsole.jsx'), 'utf8')

describe('shconsole sekunder_poison 520 — field log/agents/projects dinormalisasi', () => {
  it('baris log realtime/overview membungkus level/message/source', () => {
    expect(src).toMatch(/<b>\{normalizeSecondary\(l\.level\)[^}]*\}<\/b> · \{normalizeSecondary\(l\.message\)\}/)
    expect(src).toMatch(/\(\{normalizeSecondary\(l\.source\)[^}]*\}\)/)
    expect(src).not.toMatch(/\{l\.message\}/)
    expect(src).not.toMatch(/\{l\.source \|\|/)
    expect(src).not.toMatch(/\{l\.level \|\|/)
  })

  it('baris agents membungkus name & floor', () => {
    expect(src).toMatch(/\{normalizeClipText\(a\.name \|\| a\.id\)\}/)
    expect(src).toMatch(/Lantai \{normalizeSecondary\(a\.floor\)\}/)
    expect(src).not.toMatch(/\{a\.name \|\| a\.id\}/)
    expect(src).not.toMatch(/\{a\.floor \|\|/)
  })

  it('kartu projects membungkus status & description', () => {
    expect(src).toMatch(/\{normalizeSecondary\(p\.status\) \|\| '—'\}/)
    expect(src).toMatch(/\{normalizeSecondary\(p\.description\)\}/)
    expect(src).not.toMatch(/\{p\.status \|\|/)
    expect(src).not.toMatch(/\{p\.description \|\|/)
  })
})
