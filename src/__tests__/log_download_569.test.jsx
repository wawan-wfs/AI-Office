// @vitest-environment jsdom
// Siklus 569: ekspor log ke file .txt — formatLogFilename & formatLogFileText.
// Murni; unduhan via downloadExportFile (satu sumber kanban_export) di ActivityLog.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatLogFilename, formatLogFileText } from '../lib/storage_prefs.js'

const e = (id, status, label = status, t = '10.00.15', title = 'x') =>
  ({ t, id, status, label, title })

describe('formatLogFilename (siklus 569)', () => {
  it('nama file ber-pola log-aktivitas-YYYYMMDD-HHMMSS.txt', () => {
    const d = new Date(2026, 10, 16, 12, 5, 9) // lokal, bulan index
    const name = formatLogFilename(d)
    expect(name).toBe('log-aktivitas-20261116-120509.txt')
  })

  it('guard: Date rusak → null', () => {
    expect(formatLogFilename(new Date('bukan'))).toBe(null)
    expect(formatLogFilename(Number.NaN)).toBe(null)
  })
})

describe('formatLogFileText (siklus 569)', () => {
  it('header + garis pemisah + isi formatLogText', () => {
    const out = formatLogFileText([e(7, 'done', 'selesai')], new Date(2026, 0, 2, 3, 4, 5))
    const lines = out.split('\n')
    expect(lines[0]).toContain('Log Aktivitas WFS')
    expect(lines[0]).toContain('diekspor 20260102-030405')
    expect(lines[1]).toBe('------------------------')
    expect(lines[2]).toContain('#7')
    expect(out.endsWith('\n')).toBe(true)
  })

  it('guard: bukan array / kosong → hanya header (tanpa crash)', () => {
    const out = formatLogFileText(null, new Date(2026, 0, 1))
    expect(out).toContain('Log Aktivitas WFS')
    expect(out.split('\n')).toHaveLength(2)
    expect(formatLogFileText([], new Date(2026, 0, 1)).split('\n')).toHaveLength(2)
  })

  it('guard: now rusak → header tetap ada tanpa stempel', () => {
    const out = formatLogFileText([e(1, 'done')], new Date('x'))
    expect(out.split('\n')[0]).toBe('Log Aktivitas WFS')
  })
})

describe('ActivityLog tombol Unduh (siklus 569)', () => {
  let store
  beforeEach(() => {
    store = {}
    const fake = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v) },
      removeItem: (k) => { delete store[k] },
    }
    Object.defineProperty(global.window, 'localStorage', { value: fake, configurable: true })
    Object.defineProperty(globalThis, 'localStorage', { value: fake, configurable: true })
  })
  afterEach(() => {
    // RTL auto-cleanup butuh document kosong antar test (siklus 569).
    if (global.document?.body) global.document.body.innerHTML = ''
  })

  it('klik Unduh → downloadExportFile dipanggil dgn nama file .txt & teks log', async () => {
    const { default: ActivityLog } = await import('../components/ActivityLog.jsx')
    const ke = await import('../lib/kanban_export.js')
    const spy = vi.spyOn(ke, 'downloadExportFile').mockImplementation(() => true)
    const React = (await import('react')).default
    const { render, screen, fireEvent } = await import('@testing-library/react')
    render(React.createElement(ActivityLog, {
      show: true,
      items: [e(9, 'done', 'selesai')],
      onClose: () => {},
      onClear: () => {},
    }))
    fireEvent.click(screen.getByLabelText('Unduh log aktivitas sebagai file .txt'))
    expect(spy).toHaveBeenCalledTimes(1)
    const [content, filename, mime] = spy.mock.calls[0]
    expect(filename).toMatch(/^log-aktivitas-\d{8}-\d{6}\.txt$/)
    expect(content).toContain('#9')
    expect(mime).toContain('text/plain')
    spy.mockRestore()
  })

  it('tombol Unduh tak muncul saat items kosong', async () => {
    const { default: ActivityLog } = await import('../components/ActivityLog.jsx')
    const React = (await import('react')).default
    const { render, screen } = await import('@testing-library/react')
    render(React.createElement(ActivityLog, { show: true, items: [], onClose: () => {}, onClear: () => {} }))
    expect(screen.queryByLabelText('Unduh log aktivitas sebagai file .txt')).toBeNull()
  })
})
