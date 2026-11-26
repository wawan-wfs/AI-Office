// Siklus 487 — timer fokus ulang tablist WfsPanel dilacak & dibersihkan.
// Sebelumnya `tabKeys` menjadwalkan setTimeout(60) telanjang per keypress:
// tidak di-clear saat unmount dan menumpuk saat keypress cepat. Kini id
// disimpan di ref komponen, di-clear unmount & sebelum jadwal baru.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../components/WfsPanel.jsx'), 'utf8')

describe('wfs panel tablist timer hygiene (487)', () => {
  it('tabKeys menerima ref pelacak timer (parameter ketiga)', () => {
    expect(src).toMatch(/const tabKeys = \(e, setTab, pendingFocusRef\) =>/)
    expect(src).toMatch(/tabKeys\(e, setTab, tabFocusTmr\)/)
  })

  it('jadwal baru clear timer sebelumnya — keypress cepat tak menumpuk', () => {
    expect(src).toMatch(/clearTimeout\(pendingFocusRef\.current\)\s*\n\s*pendingFocusRef\.current = setTimeout/)
  })

  it('timer di-clear saat unmount (effect cleanup)', () => {
    expect(src).toMatch(/useEffect\(\(\) => \(\) => \{ if \(tabFocusTmr\.current\) clearTimeout\(tabFocusTmr\.current\) \}, \[\]\)/)
  })

  it('anti-poisoning: kontrak lama tak diregresi (delay 60, roving tabindex, Escape hook tak disentuh)', () => {
    expect(src).toMatch(/if \(el\) el\.focus\(\) \}, 60\)/)
    expect(src).toMatch(/tabIndex=\{tab === 'chat' \? 0 : -1\}/)
    expect(src).toMatch(/useEscapeClose/)
  })
})
