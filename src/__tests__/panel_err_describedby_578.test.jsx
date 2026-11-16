// @vitest-environment jsdom
// Siklus 578: aria-describedby error panel — pesan error (role=alert) pada
// panel dialog (Papan Task, Proyek, Statistik tim) terasosiasi ke dialog via
// aria-describedby (pola 572–576: cf-d / sm-desc / sc-err / tm-err).
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import TaskBoard from '../components/TaskBoard'
import ProjectPanel from '../components/ProjectPanel'
import TeamStats from '../components/TeamStats'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

const failFetch = () => vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503, json: async () => null })))

describe('aria-describedby error panel (siklus 578)', () => {
  it('TaskBoard: tanpa error → describedby null; fetch gagal → tb-err role=alert di dalam dialog', async () => {
    failFetch()
    render(<TaskBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Papan task' }))
    const dlg = await waitFor(() => screen.getByRole('dialog', { name: 'Papan task' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(dlg.getAttribute('aria-describedby')).toBe('tb-err')
    const errEl = document.getElementById('tb-err')
    expect(errEl.querySelector('.msg').getAttribute('role')).toBe('alert')
    expect(errEl.textContent).toMatch(/Gagal memuat task/)
    expect(dlg.contains(errEl)).toBe(true)
  })

  it('ProjectPanel: fetch gagal → describedby=pp-err, role=alert di dalam dialog; pulih → null', async () => {
    failFetch()
    render(<ProjectPanel />)
    fireEvent.click(screen.getByRole('button', { name: /proyek/i }))
    const dlg = await waitFor(() => screen.getByRole('dialog', { name: /Proyek/ }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(dlg.getAttribute('aria-describedby')).toBe('pp-err')
    expect(dlg.contains(document.getElementById('pp-err'))).toBe(true)
    // pulih
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ tasks: { total: 0, done: 0, running: 0, review: 0, failed: 0, pending: 0, recent: [] }, saas: { online: false, stats: {}, tenants: [] }, agents: [] }) })))
    fireEvent.click(screen.getByText('Coba lagi'))
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(dlg.getAttribute('aria-describedby')).toBeNull()
  })

  it('TeamStats: fetch gagal → describedby=ts-err, role=alert di dalam dialog; pulih → null', async () => {
    failFetch()
    render(<TeamStats />)
    fireEvent.click(screen.getByRole('button', { name: 'Statistik tim' }))
    const dlg = await waitFor(() => screen.getByRole('dialog', { name: 'Statistik tim' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(dlg.getAttribute('aria-describedby')).toBe('ts-err')
    expect(dlg.contains(document.getElementById('ts-err'))).toBe(true)
    vi.stubGlobal('fetch', vi.fn(async (url) => ({ ok: true, status: 200, json: async () => (String(url).includes('resources') ? { load: '0.1', ram_mb: 1, containers: [] } : { tasks: [] }) })))
    fireEvent.click(screen.getByText('Coba lagi'))
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    expect(dlg.getAttribute('aria-describedby')).toBeNull()
  })
})
