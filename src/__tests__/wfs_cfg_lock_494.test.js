// Siklus 494: lock reentrancy panel Chat AI Team (WfsPanel) — tombol Simpan /
// Reset konfigurasi dan Uji koneksi disabled via state `cfgBusy`; dua klik
// cepat sebelum re-render → saveCfg()/testCfg() jalan dua kali → POST
// config/{id} atau test dobel. Pola lock ref (490/491/492/493) kini diterapkan
// di WfsPanel: satu ref cfgInFlight menggerbangi keduanya (salah satu aksi
// menggantung mengunci aksi config lain juga — field yang sama).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const src = readFileSync(join(process.cwd(), 'src/components/WfsPanel.jsx'), 'utf8')

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

describe('guard 494 — lock reentrancy saveCfg/testCfg WfsPanel', () => {
  const save = extractFn('saveCfg')
  const test = extractFn('testCfg')

  it('saveCfg: cek awal + set lock sebelum POST config', () => {
    expect(save).toContain('if (cfgInFlight.current) return')
    expect(save).toContain('cfgInFlight.current = true')
    expect(save).toContain("method: 'POST'")
  })

  it('testCfg: cek awal + set lock sebelum POST test', () => {
    expect(test).toContain('if (cfgInFlight.current) return')
    expect(test).toContain('cfgInFlight.current = true')
    expect(test).toContain("api('test', { method: 'POST'")
  })

  it('lock dilepas di akhir kedua fungsi (setelah try/catch) dan berupa ref, bukan state', () => {
    expect(save).toContain('cfgInFlight.current = false')
    expect(test).toContain('cfgInFlight.current = false')
    expect(src).toContain('const cfgInFlight = useRef(false)')
    expect(src).not.toMatch(/useState\(.*cfgInFlight/)
  })

  it('kontrak lama tak diregresi: chatBusy masih guard send, kedua tombol tetap disabled via cfgBusy', () => {
    expect(src).toContain('if (!q || !sel || chatBusy) return')
    expect((src.match(/disabled=\{cfgBusy/g) || []).length).toBeGreaterThanOrEqual(3)
  })
})
