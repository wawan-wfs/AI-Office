// @vitest-environment jsdom
// Guard siklus 502 — App.jsx purge hook window miliknya saat unmount (pola 501).
//
// Konteks: efek init scene App memasang window.__wfsSceneSelect (cleanup sudah
// ada), tetapi window.__openSettings — fungsi yang menampilkan modal Settings —
// TIDAK dihapus saat unmount: pasca-remount/HMR hook basi memanggil setShow
// komponen gugur (stale closure). __openSettings juga masuk daftar PEMILIK LAIN
// di scene_hooks.js / NON_SCENE_OWNERS (481), artinya ia milik App dan wajib
// dibuang pemiliknya masing-masing.
//
// Pola tes: entry_mode.test.jsx — mock createOfficeScene, render App 3D penuh,
// unmount, lalu cek kedua hook undefined di window.

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor, cleanup, act } from '@testing-library/react'
const scene = vi.hoisted(() => ({ destroy: vi.fn(), isCyberpunk: () => false }))
const create = vi.hoisted(() => vi.fn(() => scene))
vi.mock('../scene/OfficeScene', () => ({ createOfficeScene: create }))
import App from '../App'

beforeEach(() => {
  window.history.replaceState(null, '', '/app/')
  localStorage.clear(); create.mockClear(); scene.destroy.mockClear()
  delete window.__wfsSceneSelect
  delete window.__openSettings
  vi.stubGlobal('fetch', vi.fn(async (url) => ({
    ok: true,
    json: async () => String(url).includes('tasks/paused')
      ? { paused: false }
      : String(url).includes('tasks')
        ? { tasks: [{ id: 1, title: 'Real task', status: 'running' }] }
        : {},
  })))
})

afterEach(() => {
  cleanup(); vi.unstubAllGlobals()
  delete window.__wfsSceneSelect
  delete window.__openSettings
})

describe('App hook purge unmount (siklus 502)', () => {
  it('unmount menghapus __wfsSceneSelect & __openSettings', async () => {
    localStorage.setItem('wfs_view_mode', '3d')
    const { unmount } = render(<App />)
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1))
    await act(async () => {})
    expect(window.__wfsSceneSelect).toBeTypeOf('function')
    expect(window.__openSettings).toBeTypeOf('function')
    unmount()
    expect(window.__wfsSceneSelect).toBeUndefined()
    expect(window.__openSettings).toBeUndefined()
    expect(scene.destroy).toHaveBeenCalledTimes(1)
  })

  it('mode ringan: unmount tanpa scene tetap membersihkan hook App (idempoten)', async () => {
    const { unmount } = render(<App />)
    await act(async () => {})
    unmount()
    expect(window.__openSettings).toBeUndefined()
    expect(window.__wfsSceneSelect).toBeUndefined()
  })
})
