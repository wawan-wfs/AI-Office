import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeClipText } from '../lib/clip.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const dash = readFileSync(path.join(dir, '..', 'components', 'Dashboard.jsx'), 'utf8')

describe('Siklus 533 — Dashboard log aktivitas anti-poisoning', () => {
  it('normalizeClipText menahan non-string', () => {
    expect(normalizeClipText({ x: 1 })).not.toContain('[object Object]')
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
  })

  it('pesan log aktivitas dashboard tanpa render mentah l.message', () => {
    // pola sweep: child/interpolasi langsung l.message (objek API bentuk sah → crash/[object Object])
    const raw = [...dash.matchAll(/\{\s*(l\.message)\s*\}/g)]
    expect(raw).toEqual([])
    expect(dash).toMatch(/clip\(normalizeClipText\(l\.message\)/)
  })

  it('normalizeClipText diimpor di Dashboard', () => {
    expect(dash).toMatch(/import \{[^}]*normalizeClipText[^}]*\} from '\.\.\/lib\/clip/)
  })
})
