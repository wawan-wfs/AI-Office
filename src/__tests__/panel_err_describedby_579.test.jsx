// @vitest-environment jsdom
// Siklus 579: lanjutan a11y dialog (pola 572–578) — Dashboard & WfsPanel:
// banner error role=alert kini ber-id stabil (db-err / wp-err) dan dialog
// aria-describedby={err ? id : undefined} — pesan error dibaca SR sebagai
// deskripsi dialog, tanpa id hantu saat tidak ada error.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import Dashboard from '../components/Dashboard'
import WfsPanel from '../components/WfsPanel'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

const failFetch = () => vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503, json: async () => null })))

describe('aria-describedby error dialog (siklus 579)', () => {
  it('Dashboard: tanpa error → describedby null; fetch gagal → db-err role=alert di dalam dialog', async () => {
    failFetch()
    render(<Dashboard />)
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }))
    const dlg = await waitFor(() => screen.getByRole('dialog', { name: 'Dashboard' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(dlg.getAttribute('aria-describedby')).toBe('db-err')
    const errEl = document.getElementById('db-err')
    expect(errEl.getAttribute('role')).toBe('alert')
    expect(errEl.textContent).toMatch(/Data belum lengkap/)
    expect(dlg.contains(errEl)).toBe(true)
  })

  it('WfsPanel: fetch gagal → describedby=wp-err di dalam dialog; pulih → null', async () => {
    failFetch()
    render(<WfsPanel />)
    fireEvent.click(screen.getByRole('button', { name: 'Chat AI Team' }))
    const dlg = await waitFor(() => screen.getByRole('dialog', { name: 'Chat dan konfigurasi agent' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(dlg.getAttribute('aria-describedby')).toBe('wp-err')
    const errEl = document.getElementById('wp-err')
    expect(errEl.getAttribute('role')).toBe('alert')
    expect(dlg.contains(errEl)).toBe(true)
    // pulih
    vi.stubGlobal('fetch', vi.fn(async (url) => ({ ok: true, status: 200, json: async () => (String(url).includes('agents') ? [] : {}) })))
    fireEvent.click(screen.getByText('Muat ulang'))
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(dlg.getAttribute('aria-describedby')).toBeNull()
  })
})
