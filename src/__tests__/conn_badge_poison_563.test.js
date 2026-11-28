// Siklus 563 — guard anti-poisoning chip HUD 'down' (connection_spec).
// Regresi: lastError bentuk sah non-string dari catch gateway (objek Error,
// {message}, array) dulu diinterpolasi mentah → '[object Object]' di detail
// chip HUD. Kini dinormalisasi via normalizeClipText (paritas 508).
import { describe, it, expect } from 'vitest'
import { applyPollResult, connectionBadge } from '../lib/connection_spec.js'
import { readFileSync } from 'node:fs'

describe('connectionBadge anti-poisoning lastError (563)', () => {
  const base = () => applyPollResult({}, { ok: false, error: { message: 'boom' } }, 1000)

  it('objek error → JSON, bukan [object Object]', () => {
    const b = connectionBadge(base(), 2000)
    expect(b.state).toBe('down')
    expect(b.detail).toContain('Gateway tak terjangkau')
    expect(b.detail).toContain('boom')
    expect(b.detail).not.toContain('[object Object]')
  })

  it('array error → JSON', () => {
    const tr = applyPollResult({}, { ok: false, error: ['ECONN', 502] }, 1000)
    const b = connectionBadge(tr, 2000)
    expect(b.detail).toContain('ECONN')
    expect(b.detail).not.toContain('[object Object]')
  })

  it('string error tetap utuh; tanpa error → detail generik', () => {
    const tr = applyPollResult({}, { ok: false, error: 'timeout' }, 1000)
    expect(connectionBadge(tr, 2000).detail).toBe('Gateway tak terjangkau (timeout)')
    const tr2 = applyPollResult({}, { ok: false }, 1000)
    expect(connectionBadge(tr2, 2000).detail).toBe('Gateway tak terjangkau (unknown)')
  })

  it('anti-regresi: sumber memakai normalizeClipText utk lastError', () => {
    const src = readFileSync(new URL('../lib/connection_spec.js', import.meta.url), 'utf8')
    expect(src).toMatch(/normalizeClipText\(t\.lastError\)/)
    expect(src).not.toMatch(/detail:\s*t\.lastError\s*\?/)
  })
})
