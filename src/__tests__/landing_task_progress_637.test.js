// Siklus 637: landing menambah progress bar task live ("N dari M task selesai")
// dari gateway /wfs-api/dashboard/stats, fallback hidden bila fetch gagal —
// paritas prinsip 632 (jangan tampilkan angka yang belum diverifikasi).
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const landing = readFileSync('public/landing.html', 'utf-8')

describe('landing task progress bar (siklus 637)', () => {
  it('elemen tprog ada, hidden default (bukan progres karangan)', () => {
    expect(landing).toContain('id="tprog" hidden')
    expect(landing).toContain('id="tprog-fill"')
    expect(landing).toContain('id="tprog-label"')
  })
  it('lebar & label diisi dari tasks_completed/tasks_total live, dengan clamp', () => {
    expect(landing).toContain('done/d.tasks_total*100')
    expect(landing).toContain("done+' dari '+d.tasks_total+' task selesai'")
    expect(landing).toContain('Math.min(d.tasks_completed,d.tasks_total)')
  })
  it('hanya tampil bila kedua angka nyata & total > 0; fetch tetap wfs-api (guard 633)', () => {
    expect(landing).toMatch(/typeof d\.tasks_total==='number' && d\.tasks_total>0/)
    expect(landing).toContain("fetch('/wfs-api/dashboard/stats')")
    expect(landing).not.toContain("fetch('/api/dashboard/stats')")
  })
})
