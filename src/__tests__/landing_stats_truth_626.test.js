// Siklus 632: landing stat "Proyek dibangun" tidak boleh menampilkan angka yang
// belum diverifikasi. Fallback hard-coded (saat fetch gagal) kini "—" — bukan
// angka basi (6 lama, lalu 1 yang kembali basi ketika DB live sudah 6 proyek).
// Fetch /api/dashboard/stats tetap menimpa dengan angka live projects_total.
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const landing = readFileSync('public/landing.html', 'utf-8')

describe('landing stat proyek (siklus 626+632)', () => {
  it('fallback s-proj tidak memakai angka lama (6 maupun 1)', () => {
    expect(landing).not.toContain('id="s-proj">6<')
    expect(landing).not.toContain('id="s-proj">1<')
  })
  it('fallback s-proj = em-dash (bukan angka saat fetch gagal)', () => {
    expect(landing).toContain('id="s-proj">—<')
  })
  it('fetch stats tetap menimpa angka live', () => {
    expect(landing).toContain("/api/dashboard/stats")
    expect(landing).toContain("el.textContent=d.projects_total")
  })
})
