import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Siklus 497 — guard lock reentrancy act() SecureProjectPanel: dobel klik cepat
// (enqueue/cancel BERBAYAR) tak mengirim POST kedua — abort ctrl lama hanya
// membatalkan respons, bukan POST baru. Pola lock ref konsisten 490–496.
const src = readFileSync(resolve(__dirname, '../components/SecureProjectPanel.jsx'), 'utf8')

describe('siklus 497 — lock reentrancy act() SecureProjectPanel', () => {
  it('1. lock ref dideklarasikan (bukan state) & digerbangi sebelum await/POST', () => {
    expect(src).toMatch(/const actInFlight = useRef\(false\)/)
    expect(src).toMatch(/if \(actInFlight\.current\) return/)
  })

  it('2. guard dipasang SEBELUM abort ctrl lama (POST baru tak lolos)', () => {
    const i = src.indexOf('if (actInFlight.current) return')
    const j = src.indexOf('act()', 100) > -1 ? src.indexOf('pending.current?.abort()', i) : -1
    expect(i).toBeGreaterThan(-1)
    expect(j).toBeGreaterThan(i)
  })

  it('3. lock dilepas di finally (semua jalur, termasuk error & abort)', () => {
    expect(src).toMatch(/actInFlight\.current = false/)
    const fin = src.indexOf('} finally {')
    expect(src.indexOf('actInFlight.current = false')).toBeGreaterThan(fin)
  })

  it('4. kontrak lama tak diregresi: idempotency-key brief + abort unmount + gate validasi', () => {
    expect(src).toMatch(/'Idempotency-Key': briefKey\.current/)
    expect(src).toMatch(/useEffect\(\(\) => \(\) => pending\.current\?\.abort\(\), \[\]\)/)
    expect(src).toMatch(/if \(!SAFE_ID\.test\(project\)/)
  })
})
