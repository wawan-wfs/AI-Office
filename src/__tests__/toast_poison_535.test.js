// Siklus 535 — anti-poisoning toast global App.jsx.
// Toast (`flash(msg)`) dirender di aria-live region; pesan bentuk sah non-string
// (objek dari callback TaskModal / field API) dulu tampil "[object Object]".
// Guard: toast child dinormalisasi via normalizeClipText (satu sumber clip.js).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { normalizeClipText } from '../lib/clip.js'

const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')

describe('toast anti-poisoning (535)', () => {
  it('kontrak normalizer: objek → JSON string, null/undefined → \'\'', () => {
    expect(normalizeClipText({ a: 1 })).toBe('{"a":1}')
    expect(normalizeClipText(null)).toBe('')
    expect(normalizeClipText(undefined)).toBe('')
    expect(normalizeClipText(42)).toBe('42')
  })

  it('App.jsx: toast child memakai normalizer, tanpa {toast.msg} mentah', () => {
    expect(app).toMatch(/\{normText\(toast\.msg\)\}/)
    expect(app).not.toMatch(/\{toast\.msg\}/)
  })

  it('App.jsx: mengimpor normalizeClipText dari lib/clip.js', () => {
    expect(app).toMatch(/import \{[^}]*normalizeClipText as normText[^}]*\} from '\.\/lib\/clip\.js'/)
  })
})
