import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeClipText } from '../lib/clip.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const tb = readFileSync(path.join(dir, '..', 'components', 'TaskBoard.jsx'), 'utf8')

describe('Siklus 530 — TaskBoard title/aria-label anti-poisoning', () => {
  it('normalizeClipText menahan non-string', () => {
    expect(normalizeClipText(String({ a: 1 }))).toBeTruthy()
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
  })

  it('interpolasi label/agent_id/shortName dalam title/aria-label dinormalisasi', () => {
    const raw = [...tb.matchAll(/(?:title|aria-label)=\{?[`'"][^`'"]*\$\{([^}]+)\}/g)]
      .map((m) => m[1].trim())
      .filter((e) => /(label|agent_id|shortName|fullName|desc|icon|name|prio\b)/.test(e))
      .filter((e) => !e.includes('normalizeClipText') && !e.includes('normErr'))
    expect(raw).toEqual([])
  })

  it('normalizeClipText diimpor di TaskBoard', () => {
    expect(tb).toMatch(/import \{[^}]*normalizeClipText[^}]*\} from '\.\.\/lib\/clip'/)
  })
})
