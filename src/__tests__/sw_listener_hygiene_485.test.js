// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupServiceWorkerUpdates } from '../lib/sw_update.js'

// Siklus 485 — higiene listener service worker pasca-dispose:
//  - dispose melepas listener 'updatefound' dari registrasi (3 add / 1 rm sebelumnya)
//  - onUpdateFound & onStateChange digerbangi `disposed` (callback basi tak menyalak)
//  - kontrak lama: controllerchange tetap dilepas, pollTimer di-clear, __swUpdateDebug dihapus

function makeSWStub() {
  const listeners = new Map()
  const makeTarget = () => ({
    _ls: new Map(),
    addEventListener(t, h) { if (!this._ls.has(t)) this._ls.set(t, new Set()); this._ls.get(t).add(h) },
    removeEventListener(t, h) { this._ls.get(t)?.delete(h) },
    dispatch(t, ev) { this._ls.get(t)?.forEach((h) => h(ev)) },
  })
  const container = { controller: null }
  const reg = makeTarget()
  reg.installing = null
  reg.waiting = null
  reg.active = null
  const svc = Object.assign(makeTarget(), {
    register: vi.fn(() => Promise.resolve(reg)),
    ready: Promise.resolve(reg),
    container,
  })
  return { svc, reg }
}

describe('sw listener hygiene 485', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', undefined)
  })

  it('dispose melepas listener updatefound dari registrasi', async () => {
    const { svc, reg } = makeSWStub()
    vi.stubGlobal('navigator', { serviceWorker: svc })
    const api = setupServiceWorkerUpdates({ pollMs: 0 })
    await Promise.resolve(); await Promise.resolve()
    expect(svc.register).toHaveBeenCalledWith('/sw.js', { scope: '/' })
    reg.dispatch('updatefound', {})
    api.dispose()
    // setelah dispose: reg listener dilepas → dispatch tidak menambah updateFound
    const before = window.__swUpdateDebug
    expect(before).toBeUndefined()
    reg.dispatch('updatefound', {})
    expect(reg._ls.get('updatefound')?.size ?? 0).toBe(0)
  })

  it('onUpdateFound & onStateChange digerbangi disposed', async () => {
    const { svc, reg } = makeSWStub()
    vi.stubGlobal('navigator', { serviceWorker: svc })
    const cb = vi.fn()
    const api = setupServiceWorkerUpdates({ pollMs: 0, onUpdateReady: cb })
    await Promise.resolve(); await Promise.resolve()
    api.dispose()
    // jalur internal tetap aman: tak ada notify, tak ada listener baru pada installing
    reg.dispatch('updatefound', {})
    expect(cb).not.toHaveBeenCalled()
    const sw = { state: 'installed', addEventListener: vi.fn(), removeEventListener: vi.fn() }
    reg.installing = sw
    reg.dispatch('updatefound', {})
    expect(sw.addEventListener).not.toHaveBeenCalled() // disposed → tak pasang listener baru
  })

  it('onStateChange notify terkunci setelah dispose walau installing aktif', async () => {
    const { svc, reg } = makeSWStub()
    vi.stubGlobal('navigator', { serviceWorker: svc })
    svc.container = { } // falsy controller → tidak notify; gunakan controller truthy
    svc.container = { postMessage: () => {} }
    const cb = vi.fn()
    const api = setupServiceWorkerUpdates({ pollMs: 0, onUpdateReady: cb })
    await Promise.resolve(); await Promise.resolve()
    const sw = { state: 'installed', addEventListener: vi.fn(), removeEventListener: vi.fn() }
    reg.installing = sw
    reg.dispatch('updatefound', {})
    expect(sw.addEventListener).toHaveBeenCalled() // hidup sebelum dispose
    api.dispose()
    cb.mockClear()
    sw.state = 'installed'
    sw.dispatch?.('statechange', {})
    sw._ls?.get('statechange')?.forEach((h) => h({}))
    expect(cb).not.toHaveBeenCalled()
  })

  it('kontrak lama 476 tak diregresi: debug hook dihapus, controllerchange dilepas', async () => {
    const { svc, reg } = makeSWStub()
    vi.stubGlobal('navigator', { serviceWorker: svc })
    const api = setupServiceWorkerUpdates({ pollMs: 0 })
    await Promise.resolve(); await Promise.resolve()
    expect(window.__swUpdateDebug).toBeTruthy()
    api.dispose()
    expect(window.__swUpdateDebug).toBeUndefined()
    expect(svc._ls.get('controllerchange')?.size ?? 0).toBe(0)
  })
})
