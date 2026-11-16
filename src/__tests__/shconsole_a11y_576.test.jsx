// @vitest-environment jsdom
import { expect, test, describe, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import ShConsole from '../components/ShConsole'

// Siklus 576: drawer Konsol Software House — pola a11y dialog lain.
// 1) aria-modal=true (sebelumnya satu-satunya dialog tanpa itu).
// 2) role=alert error terasosiasi ke dialog via aria-describedby=sc-err
//    (pola siklus 572/575) — SR membaca pesan error sebagai deskripsi dialog.
// err internal ShConsole → disimulasikan lewat api() yang reject (loadOverview).

const apiMock = vi.fn(async () => ({ projects: [] }))
vi.mock('../lib/api', () => ({ api: (...a) => apiMock(...a) }))

describe('shconsole_a11y_576', () => {
  const open = (props = {}) => render(<ShConsole show onClose={() => {}} {...props} />)
  const dlg = () => screen.getAllByRole('dialog', { name: 'Konsol Software House' })[0]

  beforeEach(() => {
    cleanup()
    apiMock.mockClear().mockImplementation(async () => ({ projects: [] }))
    // jsdom default 'prerender' → useVisibilityPoll tick tergerbang; set visible.
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  })

  test('drawer punya aria-modal=true', () => {
    open()
    expect(dlg().getAttribute('aria-modal')).toBe('true')
  })

  test('tanpa error: aria-describedby tidak dirender', () => {
    open()
    expect(dlg().getAttribute('aria-describedby')).toBeNull()
    expect(document.getElementById('sc-err')).toBeNull()
  })

  test('dengan error: describedby → sc-err berisi pesan, di dalam dialog', async () => {
    apiMock.mockImplementation(async () => { throw new Error('Gagal memuat overview') })
    open()
    await waitFor(() => expect(dlg().getAttribute('aria-describedby')).toBe('sc-err'))
    const el = document.getElementById('sc-err')
    expect(el).toBeTruthy()
    expect(dlg().contains(el)).toBe(true)
    expect(el.getAttribute('role')).toBe('alert')
    expect(el.textContent).toMatch(/Gagal memuat overview/)
  })

  test('error pulih (poll berikutnya sukses) → describedby kembali null', async () => {
    apiMock.mockImplementationOnce(async () => { throw new Error('boom') })
    open()
    await waitFor(() => expect(dlg().getAttribute('aria-describedby')).toBe('sc-err'))
    // tick berikutnya: poll visibilitychange (interval 10 dtk tak ditunggu)
    document.dispatchEvent(new Event('visibilitychange'))
    await waitFor(() => expect(dlg().getAttribute('aria-describedby')).toBeNull())
  })
})
