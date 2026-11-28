import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeClipText } from '../lib/clip.js'

// Siklus 565: guard jalur file explorer ShConsole — en.name objek bentuk sah
// (API/localStorage) harus ternormalisasi sebelum dipakai di path openEntry
// dan aria-label, agar tidak menjadi '[object Object]'.

const src = readFileSync(resolve(__dirname, '../components/ShConsole.jsx'), 'utf8')

describe('shconsole explorer poison 565', () => {
  it('objek en.name → JSON via normalizeClipText (bukan [object Object])', () => {
    const out = normalizeClipText({ a: 1 })
    expect(out).toBe('{"a":1}')
    expect(out).not.toContain('[object Object]')
  })

  it('path openEntry memakai nm ternormalisasi, bukan en.name mentah', () => {
    expect(src).toContain("const openEntry = () => (isDir ? loadWsFiles : openWsFile)(wsId, (wsPath ? wsPath + '/' : '') + nm)")
    expect(src).not.toMatch(/openWsFile\(wsId[^\n]*en\.name/)
    expect(src).not.toMatch(/loadWsFiles\(wsId[^\n]*en\.name/)
  })

  it('aria-label & child file explorer memakai nm', () => {
    expect(src).toMatch(/aria-label=\{`\$\{en\.type === 'dir' \? 'Folder' : 'File'\}: \$\{nm\}`\}/)
    expect(src).not.toMatch(/aria-label=\{`[^`]*\$\{en\.name/)
  })

  it('anti-regresi: filter null tetap sebelum normalisasi', () => {
    expect(src).toMatch(/if \(typeof en !== 'object' \|\| en === null \|\| !en\.name\) return null/)
    expect(src).toMatch(/const nm = normalizeClipText\(en\.name\)/)
  })
})
