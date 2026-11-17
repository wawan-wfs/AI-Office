// @vitest-environment jsdom
// Siklus 606 — guard regresi: badge ikon PWA wajib mengikuti hasil poll INI,
// bukan state closure `pendingCount` yang basi.
//
// Bug 605: `badgeRef.current.set(pendingCount)` dieksekusi di dalam
// refreshStatus yang di-memo dengan deps [flash, pushLog] — `pendingCount`
// yang terkurung adalah nilai render SAAT CALLBACK DIBUAT (efek polling hanya
// dipasang sekali). Akibatnya badge selalu tertinggal satu poll di belakang
// status HUD, dan pada poll pertama (0 → N) badge tidak pernah menyala.
// Perbaikan: hitung `pc` lalu setPendingCount(pc) DAN badge.set(pc).
import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, waitFor, cleanup, act, screen } from '@testing-library/react'

const mockSceneInstance = {
  isAudioMuted: vi.fn(() => false),
  setAudioMuted: vi.fn(),
  playTaskDone: vi.fn(),
  playTaskFail: vi.fn(),
  isCyberpunk: () => false,
  toggleCyberpunk: vi.fn(),
  setTime: vi.fn(),
  destroy: vi.fn(),
}

vi.mock('../scene/OfficeScene', () => ({
  createOfficeScene: vi.fn(() => mockSceneInstance),
}))

import App from '../App'

let badgeCalls
let tasksReply

beforeEach(() => {
  badgeCalls = { set: [], clear: 0 }
  vi.stubGlobal('localStorage', {
    store: {},
    getItem(k) { return this.store[k] ?? null },
    setItem(k, v) { this.store[k] = v },
    removeItem(k) { delete this.store[k] },
  })
  Object.defineProperty(navigator, 'setAppBadge', {
    configurable: true,
    value: async (n) => { badgeCalls.set.push(n) },
  })
  Object.defineProperty(navigator, 'clearAppBadge', {
    configurable: true,
    value: async () => { badgeCalls.clear++ },
  })
  tasksReply = async () => ({ tasks: [] })
  vi.stubGlobal('fetch', vi.fn((url) => {
    const u = String(url)
    if (u.includes('tasks/paused')) return Promise.resolve({ ok: true, json: async () => ({ paused: false }) })
    if (u.includes('/tasks')) return Promise.resolve({ ok: true, json: async () => tasksReply() })
    return Promise.resolve({ ok: true, json: async () => ({}) })
  }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete navigator.setAppBadge
  delete navigator.clearAppBadge
})

const settle = async () => { await act(async () => { await Promise.resolve() }) }

describe('App badge — sinkron dengan poll terkini (606)', () => {
  it('poll pertama dgn 3 task pending → badge 3 (bukan tertinggal di 0)', async () => {
    tasksReply = async () => ({
      tasks: [
        { id: 1, title: 'A', status: 'pending' },
        { id: 2, title: 'B', status: 'pending' },
        { id: 3, title: 'C', status: 'failed' },
      ],
    })
    localStorage.setItem('wfs_view_mode', '3d')
    render(<App />)
    await waitFor(() => expect(badgeCalls.set).toContain(3))
    expect(badgeCalls.set[0]).toBe(3) // poll pertama langsung benar, tanpa 0 basi
  })

  it('poll kedua menurunkan jumlah → badge ikut turun pada poll yang sama', async () => {
    tasksReply = async () => ({
      tasks: [
        { id: 1, title: 'A', status: 'pending' },
        { id: 2, title: 'B', status: 'review' },
      ],
    })
    localStorage.setItem('wfs_view_mode', '3d')
    render(<App />)
    await waitFor(() => expect(badgeCalls.set).toContain(2))
    // jumlah turun ke 1; poll disulut via event 'online' (tick segera)
    tasksReply = async () => ({ tasks: [{ id: 1, title: 'A', status: 'running' }] })
    await act(async () => { window.dispatchEvent(new Event('online')) })
    await waitFor(() => expect(screen.getByText('1 jalan · 0 antri')).toBeTruthy())
    expect(badgeCalls.clear).toBe(1) // clear lewat set(0) — tidak tertinggal di 2
    await settle()
  })

  it('tidak ada task menunggu → badge dibersihkan, tanpa nilai NaN', async () => {
    tasksReply = async () => ({ tasks: [] })
    localStorage.setItem('wfs_view_mode', '3d')
    render(<App />)
    await waitFor(() => expect(screen.getByText('0 jalan · 0 antri')).toBeTruthy())
    await settle()
    expect(badgeCalls.set.every((n) => Number.isFinite(n))).toBe(true)
    expect(badgeCalls.set).not.toContain(Number.NaN)
  })
})
