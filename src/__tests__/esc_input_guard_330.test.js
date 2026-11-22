import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Siklus 330: Escape scene reset-focus kini GUARD INPUT — mengetik di field
// teks (search task board, form TaskModal, dsb) lalu tekan Escape TIDAK BOLEH
// me-reset fokus kamera ke home / membatalkan seleksi agen. Pola guard sudah
// ada di __onOrbitKey (siklus 177); handler Escape (onKey) tertinggal tanpa
// guard → kebiasaan "Escape utk keluar/kosongkan input" menggiring kamera.
const here = dirname(fileURLToPath(import.meta.url))
const scene = readFileSync(join(here, '../scene/OfficeScene.js'), 'utf8')

describe('siklus 330 — Escape scene reset-focus guard input', () => {
  it('isTypingTarget didefinisikan & dipakai guard onKey Escape', () => {
    expect(scene).toContain("const isTypingTarget=(t)=>t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable)")
    expect(scene).toMatch(/const onKey=\(e\)=>\{ if\(e\.key==='Escape'[^}]*&&focusGoal&&!isTypingTarget\(e\.target\)\)/)
  })

  it('guard modal snapshot (__escModalAtDispatch) tetap dipertahankan di onKey', () => {
    expect(scene).toMatch(/const onKey=\(e\)=>\{ if\(e\.key==='Escape'&&window\.__escModalAtDispatch===false/)
  })

  it('pola guard input di __onOrbitKey: blokir saat mengetik (siklus 281 — logika terbalik diperbaiki)', () => {
    // Siklus 281: guard lama `if(!isTypingTarget(e.target))return` TERBALIK —
    // orbit keyboard hanya aktif saat mengetik; panah di body no-op (bug nyata,
    // terbukti e2e_orbit_keys TES1-4 FAIL lalu OK pasca-fix).
    expect(scene).toContain('if(isTypingTarget(e.target))return; // sedang mengetik — panah milik input')
    const uses = scene.split('isTypingTarget(').length - 1
    expect(uses).toBeGreaterThanOrEqual(2) // definisi + guard onKey + guard __onOrbitKey
  })
})
