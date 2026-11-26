// Siklus 491: lock reentrancy create project ShConsole — tombol "Buat project
// & jalankan container" disabled via `busy`, tapi `busy` adalah state React:
// dua klik cepat sebelum re-render → create() jalan dua kali → POST /projects
// dobel (dua project duplikat). Pola lock ref (runTask/runAllPending/task 490)
// kini diterapkan juga di create().
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const src = readFileSync(join(process.cwd(), 'src/components/ShConsole.jsx'), 'utf8')

const extractFn = (name) => {
  const i = src.indexOf(`const ${name} = async`)
  expect(i, `${name} ditemukan`).toBeGreaterThan(-1)
  let depth = 0, started = false, end = i
  for (let j = src.indexOf('{', i); j < src.length; j++) {
    if (src[j] === '{') { depth++; started = true }
    else if (src[j] === '}') { depth--; if (started && depth === 0) { end = j + 1; break } }
  }
  return src.slice(i, end)
}

describe('guard 491 — lock reentrancy create project ShConsole', () => {
  const fn = extractFn('create')

  it('ada lock projectInFlight: cek awal + set sebelum POST', () => {
    expect(fn).toContain('if (projectInFlight.current) return')
    expect(fn).toContain('projectInFlight.current = true')
  })

  it('lock dilepas hanya milik rid sendiri (create baru tetap terkunci)', () => {
    expect(fn).toContain('actRid.current.create === rid) projectInFlight.current = false')
  })

  it('projectInFlight adalah ref, bukan state (tak kena race re-render)', () => {
    expect(src).toContain('const projectInFlight = useRef(false)')
  })

  it('kontrak lama tak diregresi: rid per-surface create + guardAct + lock task 490', () => {
    expect(src).toContain("actRid = useRef({ term: 0, git: 0, sb: 0, approval: 0, create: 0, task: 0, run: 0, bulk: 0 })")
    expect(fn).toContain("++actRid.current.create")
    expect(fn).toContain("guardAct('create', rid)")
    expect(src).toContain('const taskInFlight = useRef(false)')
  })
})
