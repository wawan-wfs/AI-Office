// @vitest-environment jsdom
// Siklus 562 — guard gerbang visibility poll SW (paritas 473).
// Dua bahaya yang dicek:
//  1. Tab HIDDEN → tick poll TIDAK memanggil checkWaiting (tak ada notifikasi
//     sia-sia di latar; banner tak terlihat).
//  2. Pasca VISIBLE → checkWaiting tetap tertutup utk waiting yang sudah ada
//     (poll mengalir lagi tanpa event updatefound).
// Ditambah anti-regresi: pola gerbang wajib ada di sumber.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { setupServiceWorkerUpdates } from '../lib/sw_update'

function makeFakeSW({ controller = false, withWaiting = false } = {}) {
  const reg = {
    installing: null,
    waiting: withWaiting ? { postMessage: vi.fn() } : null,
    active: {},
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  const sw = {
    controller: controller ? {} : null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    register: vi.fn(() => Promise.resolve(reg)),
  }
  return { sw, reg }
}

beforeEach(() => { vi.stubGlobal('location', { reload: vi.fn() }) })
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('sw_update — gerbang visibility poll (562)', () => {
  it('tab hidden → checkWaiting tidak dijalankan oleh tick (onUpdateReady tidak naik)', async () => {
    const { sw } = makeFakeSW({ controller: true })
    vi.stubGlobal('navigator', { serviceWorker: sw })
    // hidden DULU, waiting baru terisi belakangan → hanya tick yang bisa melihatnya
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    const onReady = vi.fn()
    setupServiceWorkerUpdates({ onUpdateReady: onReady, pollMs: 20 })
    await vi.waitFor(() => expect(sw.register).toHaveBeenCalled())
    const reg = await sw.register.mock.results[0].value
    reg.waiting = { postMessage: vi.fn() } // muncul setelah mount (path khusus tick)
    await new Promise(r => setTimeout(r, 80)) // beberapa tick dalam kondisi hidden
    expect(onReady).not.toHaveBeenCalled()
  })

  it('pasca tab visible kembali → checkWaiting menemukan waiting (banner naik)', async () => {
    const { sw } = makeFakeSW({ controller: true })
    vi.stubGlobal('navigator', { serviceWorker: sw })
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    const onReady = vi.fn()
    setupServiceWorkerUpdates({ onUpdateReady: onReady, pollMs: 20 })
    await vi.waitFor(() => expect(sw.register).toHaveBeenCalled())
    const reg = await sw.register.mock.results[0].value
    reg.waiting = { postMessage: vi.fn() }
    await vi.waitFor(() => expect(onReady).toHaveBeenCalledTimes(1))
  })

  it('anti-regresi: pola gerbang visibilityState ada di sumber sw_update.js', () => {
    const src = readFileSync(resolve(__dirname, '../lib/sw_update.js'), 'utf8')
    expect(src).toContain("document.visibilityState === 'hidden'")
    expect(src).toContain('pollTimer')
  })
})
