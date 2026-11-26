// Siklus 490: lock reentrancy create task ShConsole — tombol "Tambah task"
// disabled via `busy`, tapi `busy` adalah state React: dua klik cepat pada
// klik pertama belum re-render → createTask() jalan dua kali → POST /tasks
// dobel (dua task duplikat). Pola runTask/runAllPending (lock ref) kini
// diterapkan juga di createTask.
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

describe('guard 490 — lock reentrancy createTask ShConsole', () => {
  const fn = extractFn('createTask')

  it('ada lock taskInFlight: cek awal + set sebelum POST', () => {
    expect(fn).toContain('if (taskInFlight.current) return')
    expect(fn).toContain('taskInFlight.current = true')
  })

  it('lock dilepas hanya milik rid sendiri (create baru tetap terkunci)', () => {
    expect(fn).toContain('actRid.current.task === rid) taskInFlight.current = false')
  })

  it('taskInFlight adalah ref, bukan state (tak kena race re-render)', () => {
    expect(src).toContain('const taskInFlight = useRef(false)')
  })

  it('kontrak lama tak diregresi: rid per-surface task + guardAct + runInFlight 413', () => {
    expect(src).toContain("actRid = useRef({ term: 0, git: 0, sb: 0, approval: 0, create: 0, task: 0, run: 0, bulk: 0 })")
    expect(fn).toContain("++actRid.current.task")
    expect(fn).toContain("guardAct('task', rid)")
    expect(src).toContain('const runInFlight = useRef(new Set())')
  })
})
