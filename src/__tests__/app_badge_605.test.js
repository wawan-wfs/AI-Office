// Siklus 605 — guard test App Badging (src/lib/app_badge.js).
// navigator disuntikkan (pola wakelock.test.js) — murni & tanpa DOM.
import { describe, it, expect } from 'vitest'
import { createAppBadgeManager } from '../lib/app_badge.js'

const navWith = () => {
  const calls = { set: [], clear: 0 }
  const nav = {
    setAppBadge: async (n) => { calls.set.push(n) },
    clearAppBadge: async () => { calls.clear++ },
  }
  nav.__calls = calls
  return nav
}

describe('createAppBadgeManager — unsupported', () => {
  it('nav tanpa setAppBadge → unsupported, semua no-op tanpa error', async () => {
    const states = []
    const m = createAppBadgeManager({}, { onState: (s) => states.push(s) })
    expect(m.state()).toBe('unsupported')
    expect(states).toEqual(['unsupported'])
    await expect(m.set(3)).resolves.toBe('unsupported')
    await expect(m.clear()).resolves.toBe('unsupported')
    expect(m.state()).toBe('unsupported')
  })
  it('navigator null juga aman', () => {
    const m = createAppBadgeManager(null)
    expect(m.state()).toBe('unsupported')
  })
})

describe('createAppBadgeManager — set/clear', () => {
  it('set(4) → setAppBadge(4), state set, value 4', async () => {
    const nav = navWith()
    const m = createAppBadgeManager(nav)
    await expect(m.set(4)).resolves.toBe('set')
    expect(nav.__calls.set).toEqual([4])
    expect(m.state()).toBe('set')
    expect(m.value()).toBe(4)
  })
  it('set(0) / set(null) / set(NaN) → clear, tanpa badge palsu', async () => {
    const nav = navWith()
    const m = createAppBadgeManager(nav)
    await m.set(0) // belum pernah di-set → idempoten, tanpa clearAppBadge
    expect(nav.__calls.clear).toBe(0)
    expect(nav.__calls.set).toEqual([])
    await m.set(2)
    await m.set(0)
    expect(nav.__calls.clear).toBe(1) // setelah ada badge → clear
    await m.set(null)
    await m.set(Number.NaN)
    await m.set(-2)
    expect(nav.__calls.clear).toBe(1) // idempoten: sudah cleared, tak spam clear
    expect(nav.__calls.set).toEqual([2])
    expect(m.state()).toBe('cleared')
    expect(m.value()).toBeNull()
  })
  it('idempoten: nilai sama tak memanggil setAppBadge ulang', async () => {
    const nav = navWith()
    const m = createAppBadgeManager(nav)
    await m.set(3)
    await m.set(3)
    await m.set(3)
    expect(nav.__calls.set).toEqual([3])
    await m.set(5)
    expect(nav.__calls.set).toEqual([3, 5])
    await m.set(5)
    expect(nav.__calls.set).toEqual([3, 5])
  })
  it('desimal difloor, negatif→clear', async () => {
    const nav = navWith()
    const m = createAppBadgeManager(nav)
    await m.set(7.9)
    expect(nav.__calls.set).toEqual([7])
    await m.set(-1)
    expect(nav.__calls.clear).toBe(1)
    expect(m.state()).toBe('cleared')
  })
  it('set→clear→set: badge kembali', async () => {
    const nav = navWith()
    const m = createAppBadgeManager(nav)
    await m.set(2)
    await m.clear()
    expect(nav.__calls.clear).toBe(1)
    expect(m.value()).toBeNull()
    await m.set(9)
    expect(nav.__calls.set).toEqual([2, 9])
    expect(m.state()).toBe('set')
  })
  it('onState mengikuti transisi', async () => {
    const nav = navWith()
    const states = []
    const m = createAppBadgeManager(nav, { onState: (s) => states.push(s) })
    await m.set(1)
    await m.clear()
    await m.clear()
    expect(states).toEqual(['set', 'cleared'])
  })
})
