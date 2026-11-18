// Siklus 626: landing stat "Proyek dibangun" tidak boleh menampilkan angka palsu.
// Fallback hard-coded harus == projects_total nyata dari API /api/dashboard/stats
// (DB live = 1 proyek saat siklus 626). Jika proyek baru dibuat, angka live menimpa.
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const landing = readFileSync('public/landing.html', 'utf-8')

describe('landing stat proyek (siklus 626)', () => {
  it('fallback s-proj tidak memakai angka lama 6', () => {
    expect(landing).not.toContain('id="s-proj">6<')
  })
  it('fallback s-proj = 1 (paritas dengan projects_total API live)', () => {
    expect(landing).toContain('id="s-proj">1<')
  })
  it('fetch stats tetap menimpa angka live', () => {
    expect(landing).toContain("/api/dashboard/stats")
    expect(landing).toContain("el.textContent=d.projects_total")
  })
})
