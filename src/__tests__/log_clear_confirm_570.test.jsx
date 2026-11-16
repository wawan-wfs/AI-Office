// @vitest-environment jsdom
// Siklus 570: tombol "Bersihkan" log kini lewat konfirmasi generik (ConfirmModal
// via onAsk) — pembersihan permanen jangan sekali klik. Tanpa onAsk → langsung
// clear (kompatibilitas pemanggil lama).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const e = (id, status, label = status, t = '10.00.15', title = 'x') =>
  ({ t, id, status, label, title })

describe('ActivityLog tombol Bersihkan dgn konfirmasi (siklus 570)', () => {
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

  const mount = async (props) => {
    const { default: ActivityLog } = await import('../components/ActivityLog.jsx')
    const React = (await import('react')).default
    const { render, screen, fireEvent } = await import('@testing-library/react')
    render(React.createElement(ActivityLog, { show: true, items: [e(7, 'done', 'selesai')], onClose: () => {}, ...props }))
    return { screen, fireEvent }
  }

  it('dengan onAsk: klik Bersihkan → dialog konfirmasi muncul, clear BARU jalan setelah Ya', async () => {
    const onClear = vi.fn()
    const onAsk = vi.fn()
    const { screen, fireEvent } = await mount({ onClear, onAsk })
    fireEvent.click(screen.getByLabelText('Bersihkan log aktivitas'))
    expect(onClear).not.toHaveBeenCalled()
    expect(onAsk).toHaveBeenCalledTimes(1)
    const ask = onAsk.mock.calls[0][0]
    expect(ask.title).toContain('Bersihkan')
    expect(ask.body).toContain('tidak bisa dikembalikan')
    expect(ask.ok).toBe('Ya, bersihkan')
    ask.onOk()
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('batal (onOk tak dipanggil) → log tetap utuh', async () => {
    const onClear = vi.fn()
    const { screen, fireEvent } = await mount({ onClear, onAsk: vi.fn() })
    fireEvent.click(screen.getByLabelText('Bersihkan log aktivitas'))
    expect(onClear).not.toHaveBeenCalled()
  })

  it('tanpa onAsk: klik Bersihkan → langsung onClear (perilaku lama)', async () => {
    const onClear = vi.fn()
    const { screen, fireEvent } = await mount({ onClear })
    fireEvent.click(screen.getByLabelText('Bersihkan log aktivitas'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('tombol Bersihkan tak ada saat items kosong', async () => {
    const { default: ActivityLog } = await import('../components/ActivityLog.jsx')
    const React = (await import('react')).default
    const { render, screen } = await import('@testing-library/react')
    render(React.createElement(ActivityLog, { show: true, items: [], onClose: () => {}, onClear: () => {}, onAsk: vi.fn() }))
    expect(screen.queryByLabelText('Bersihkan log aktivitas')).toBeNull()
  })
})
