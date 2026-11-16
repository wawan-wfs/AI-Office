// @vitest-environment jsdom
// Siklus 571: perubahan status task diumumkan ke screen reader (aria-live
// region 'N task …' di footer dialog Log) — dulu daftar berubah diam-diam.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const e = (id, status, label = status, t = '10.00.15', title = 'x') =>
  ({ t, id, status, label, title })

describe('ActivityLog region aria-live (siklus 571)', () => {
  let store
  beforeEach(() => {
    store = {}
    const fake = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v) },
      removeItem: (k) => { delete store[k] },
    }
    Object.defineProperty(globalThis, 'localStorage', { value: fake, configurable: true })
    if (global.window) Object.defineProperty(global.window, 'localStorage', { value: fake, configurable: true })
  })
  afterEach(() => {
    if (global.document?.body) global.document.body.innerHTML = ''
  })

  const mount = async (items) => {
    const { default: ActivityLog } = await import('../components/ActivityLog.jsx')
    const React = (await import('react')).default
    const { render, screen, rerender } = await import('@testing-library/react')
    const api = render(React.createElement(ActivityLog, { show: true, items, onClose: () => {}, onClear: () => {}, onAsk: vi.fn() }))
    return { screen, rerender: (it) => api.rerender(React.createElement(ActivityLog, { show: true, items: it, onClose: () => {}, onClear: () => {}, onAsk: vi.fn() })) }
  }

  it('ada region aria-live polite berisi jumlah item saat terbuka', async () => {
    const { screen } = await mount([e(1, 'done', 'selesai'), e(2, 'failed', 'gagal')])
    const reg = screen.getByText('2 perubahan status task')
    expect(reg).not.toBeNull()
    expect(reg.getAttribute('aria-live')).toBe('polite')
  })

  it('jumlah mengikuti perubahan items (awal 0 → 2)', async () => {
    const { screen, rerender } = await mount([])
    expect(screen.getByText('0 perubahan status task')).not.toBeNull()
    rerender([e(1, 'done', 'selesai'), e(2, 'running', 'jalan')])
    expect(screen.getByText('2 perubahan status task')).not.toBeNull()
  })

  it('label tunggal: 1 perubahan', async () => {
    const { screen } = await mount([e(9, 'done', 'selesai')])
    expect(screen.getByText('1 perubahan status task')).not.toBeNull()
  })
})
