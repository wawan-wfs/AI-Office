// @vitest-environment jsdom
// Guard 495: lock per-rid dobel klik tombol konfirmasi dialog pause/resume ALL
// (App.jsx doConfirm). dobel klik cepat sebelum re-render menjalankan doConfirm()
// dua kali → POST pause_all / resume_all terkirim dua kali (resume BERBAYAR).
// Kontrak:
//  1. cek lock SEBELUM bump rid (klik ditolak tak menggeser kepemilikan rid)
//  2. lock dilepas di finally hanya jika masih milik rid sendiri
//  3. openConfirm/closeConfirm me-reset lock — dialog buka ulang = generasi baru boleh submit
//  4. lock via ref (confirmInFlight), bukan state — tak memicu render
//  5. kontrak endpoint: POST pause_all / resume_all via api()
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react'

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
vi.mock('../scene/OfficeScene', () => ({ createOfficeScene: vi.fn(() => mockSceneInstance) }))
import App from '../App'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

const confirmBtn = () => screen.getByRole('button', { name: /Memproses…|Ya, jalankan/ })

describe('App doConfirm — lock per-rid dobel klik konfirmasi (siklus 495)', () => {
  it('dobel klik konfirmasi resume mengirim HANYA SATU POST resume_all (BERBAYAR)', async () => {
    const posts = []
    let release // gate POST: tetap menggantung selama dobel klik
    vi.stubGlobal('fetch', vi.fn((url, opts = {}) => {
      const u = String(url)
      const m = (opts.method || 'GET').toUpperCase()
      if (m === 'POST' && u.includes('resume_all')) {
        posts.push('POST resume_all')
        return new Promise((res) => { release = () => res({ ok: true, json: async () => ({ started: [1] }) }) })
      }
      if (u.includes('tasks/paused')) return Promise.resolve({ ok: true, json: async () => ({ paused: true }) })
      if (u.includes('/tasks')) return Promise.resolve({ ok: true, json: async () => ({ tasks: [] }) })
      return Promise.resolve({ ok: true, json: async () => ({}) })
    }))
    vi.stubGlobal('localStorage', { store: { wfs_view_mode: '3d' }, getItem(k) { return this.store[k] ?? null }, setItem(k, v) { this.store[k] = v }, removeItem(k) { delete this.store[k] } })
    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Lanjutkan semua task' })).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan semua task' }))
    fireEvent.click(screen.getByRole('alertdialog').querySelector('.btn.primary'))
    // dobel klik cepat pada tombol yang sama (belum re-render disabled)
    const btn = confirmBtn()
    fireEvent.click(btn)
    fireEvent.click(btn)

    await act(async () => { release() })
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(posts).toEqual(['POST resume_all']) // HANYA satu POST
    expect(await screen.findByText('Dilanjutkan — 1 task dijalankan')).toBeTruthy()
  })
})
