// Siklus 635: landing menambah stat live "Task selesai" dari gateway task engine
// (/wfs-api/dashboard/stats -> tasks_completed, fallback "—" bila fetch gagal),
// paritas dgn stat "Proyek dibangun" (siklus 626+632+633).
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const landing = readFileSync('public/landing.html', 'utf-8')

describe('landing stat task selesai (siklus 635)', () => {
  it('elemen s-task ada dgn fallback em-dash, bukan angka hard-coded', () => {
    expect(landing).toContain('id="s-task" lang="id">—<')
    expect(landing).not.toMatch(/id="s-task">\d+</)
  })
  it('fetch gateway mengisi tasks_completed live', () => {
    expect(landing).toContain("st.textContent=d.tasks_completed")
    expect(landing).toContain("fetch('/wfs-api/dashboard/stats')")
  })
  it('guard 626/632/633 tetap berlaku (s-proj fallback em-dash, fetch wfs-api)', () => {
    expect(landing).toContain('id="s-proj" lang="id">—<')
    expect(landing).toContain('el.textContent=d.projects_total')
    expect(landing).not.toContain("fetch('/api/dashboard/stats')")
  })
})
