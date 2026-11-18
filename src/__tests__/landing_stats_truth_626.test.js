// Siklus 633: landing stat "Proyek dibangun" harus membaca gateway task engine
// (:8787 via proxy /wfs-api/dashboard/stats = DB live 6 proyek), BUKAN DB UI
// ~/wfs-projects/wfs_software_house.db yang basi (1 proyek) lewat
// /api/dashboard/stats. Fallback tetap "—" (siklus 632) bila fetch gagal.
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const landing = readFileSync('public/landing.html', 'utf-8')

describe('landing stat proyek (siklus 626+632+633)', () => {
  it('fallback s-proj tidak memakai angka lama (6 maupun 1)', () => {
    expect(landing).not.toContain('id="s-proj">6<')
    expect(landing).not.toContain('id="s-proj">1<')
  })
  it('fallback s-proj = em-dash (bukan angka saat fetch gagal)', () => {
    expect(landing).toContain('id="s-proj">—<')
  })
  it('fetch stats menimpa angka live dari gateway task engine', () => {
    expect(landing).toContain("fetch('/wfs-api/dashboard/stats')")
    expect(landing).not.toContain("fetch('/api/dashboard/stats')")
    expect(landing).toContain('el.textContent=d.projects_total')
  })
})
