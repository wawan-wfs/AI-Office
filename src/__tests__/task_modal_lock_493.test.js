import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const src = readFileSync(join(process.cwd(), 'src/components/TaskModal.jsx'), 'utf8')

describe('Siklus 493 — lock reentrancy submit TaskModal (per-rid, revisi 494)', () => {
  it('submit() memegang lock ref sebelum await (rid lalu cek+set lock)', () => {
    expect(src).toMatch(/const submitInFlight = useRef\(false\)/)
    // urutan: rid -> guard (tolak milik generasi lain) -> set -> try
    const body = src.slice(src.indexOf('const submit = async'))
    const rid = body.indexOf('const my = rid.current')
    const guard = body.indexOf('if (submitInFlight.current === my) return')
    const set = body.indexOf('submitInFlight.current = my')
    const tr = body.indexOf('try {')
    expect(rid).toBeGreaterThan(-1)
    expect(guard).toBeGreaterThan(rid)
    expect(set).toBeGreaterThan(guard)
    expect(tr).toBeGreaterThan(set)
  })

  it('lock dilepas di finally HANYA milik sendiri (generasi baru tak dilepas submit lama)', () => {
    const body = src.slice(src.indexOf('const submit = async'))
    expect(body).toMatch(/finally\s*\{\s*if \(submitInFlight\.current === my\) submitInFlight\.current = false\s*\}/)
  })

  it('lock via ref, bukan state (tak memicu render ekstra)', () => {
    expect(src).not.toMatch(/useState\(.*[iI]nFlight/)
    expect(src).not.toMatch(/setSubmitInFlight/)
  })

  it('kontrak rid per-modal & run berbayar gated tetap utuh (132)', () => {
    expect(src).toMatch(/if \(my !== rid\.current\) return \/\/ basi: task lama TIDAK dijalankan/)
    expect(src).toMatch(/if \(run\) await api\(`tasks\/\$\{d\.task_id\}\/run`/)
    expect(src).toMatch(/rid\.current\+\+ \/\/ modal dibuka ulang/)
  })
})
