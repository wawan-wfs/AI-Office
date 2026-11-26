// Siklus 492: lock reentrancy POST run TaskBoard — tombol "Jalankan" di dialog
// konfirmasi (ConfirmModal generik `ask`) tidak punya state disabled sendiri;
// dobel klik cepat pada klik pertama belum menutup modal → run(t) jalan dua
// kali → POST /tasks/{id}/run dobel (BERBAYAR, memanggil model AI dua kali).
// Pola lock ref runInFlight Set (ShConsole 413/490) kini diterapkan di TaskBoard.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const src = readFileSync(join(process.cwd(), 'src/components/TaskBoard.jsx'), 'utf8')

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

describe('guard 492 — lock reentrancy run TaskBoard', () => {
  const fn = extractFn('run')

  it('ada lock runInFlight: cek awal + add sebelum POST', () => {
    expect(fn).toContain('runInFlight.current.has(t.id)') && expect(fn).toContain('if (runInFlight.current.has(t.id)) return')
    expect(fn).toContain('runInFlight.current = new Set(runInFlight.current).add(t.id)')
  })

  it('lock dilepas di finally (per task id, bukan global)', () => {
    expect(fn).toContain('finally')
    expect(fn).toContain('runInFlight.current.delete(t.id)')
  })

  it('runInFlight adalah ref Set, bukan state (tak kena race re-render)', () => {
    expect(src).toContain('const runInFlight = useRef(new Set())')
  })

  it('kontrak POST run tak diregresi: endpoint + body {} + onFlash gagal jujur', () => {
    expect(fn).toContain("api(`tasks/${t.id}/run`, { method: 'POST', body: {} })")
    expect(fn).toContain("onFlash(e.message || 'Gagal menjalankan task', true)")
    expect(src).toContain('onOk: () => run(t)')
  })
})
