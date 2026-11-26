// Siklus 496: lock reentrancy send() chat WfsPanel — tombol Kirim disabled
// via state `chatBusy`; dua klik cepat sebelum re-render menjalankan send()
// dua kali → POST chat dobel (dobel pesan ke agent). Pola lock ref
// (490/491/492/493/494/495) kini menutup permukaan POST terakhir tanpa lock:
// chatInFlight ref — guard+set sebelum await apa pun, dilepas setelah
// try/catch (finally-style, semua jalur melepas lock).
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

describe('guard 496 — lock reentrancy send() chat WfsPanel', () => {
  const send = extractFn('send')

  it('send: cek awal + set chatInFlight sebelum await/POST apa pun', () => {
    expect(send).toContain('if (chatInFlight.current) return')
    expect(send).toContain('chatInFlight.current = true')
    const iSet = send.indexOf('chatInFlight.current = true')
    const iPost = send.indexOf("api('chat'")
    expect(iSet).toBeGreaterThan(-1)
    expect(iPost).toBeGreaterThan(iSet)
  })

  it('lock dilepas di akhir send (setelah try/catch) dan berupa ref, bukan state', () => {
    expect(send).toContain('chatInFlight.current = false')
    expect(src).toContain('const chatInFlight = useRef(false)')
    expect(src).not.toMatch(/useState\([^)]*chatInFlight/)
  })

  it('POST chat tunggal dalam send — tak ada jalur kedua', () => {
    expect((send.match(/api\('chat'/g) || []).length).toBe(1)
  })

  it('kontrak lama tak diregresi: guard 494 cfgInFlight + chatBusy state tetap utuh', () => {
    expect(src).toContain('const cfgInFlight = useRef(false)')
    expect(src).toContain('if (!q || !sel || chatBusy) return')
    expect(send).toContain('setChatBusy(true)')
    expect(send).toContain('setChatBusy(false)')
  })
})
