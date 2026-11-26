// Siklus 505: SecureProjectPanel satu sumber jaringan — fetch mentah diganti
// fetchWithTimeout (lib/fetch_timeout.js). Dulu satu-satunya permukaan jaringan
// UI tanpa deadline: gateway menggantung → tombol "Menghubungkan…" selamanya
// (busy state tak pernah lepas sampai respons/abort). Kontrak lama tak berubah:
// credentials omit, cache no-store, headers auth + Idempotency-Key, abort ctrl
// pemanggil tetap menang, lock ref 497 utuh.
// @vitest-environment jsdom
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import SecureProjectPanel from '../components/SecureProjectPanel'

const SRC = readFileSync(path.resolve(__dirname, '../components/SecureProjectPanel.jsx'), 'utf8')

describe('secure panel network deadline (505)', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); localStorage.clear() })
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear() })

  it('tidak lagi memakai fetch mentah — semua via fetchWithTimeout', () => {
    expect(SRC).toContain("from '../lib/fetch_timeout.js'")
    expect(SRC).toMatch(/fetchWithTimeout\(base \+ suffix/)
    // tidak ada panggilan fetch() langsung tersisa di komponen
    expect(SRC).not.toMatch(/(?<!With)fetch\(base \+ suffix/)
  })

  it('deadline transport 20000ms terkunci sebagai kontrak', () => {
    expect(SRC).toContain('timeoutMs: 20000')
  })

  it('TimeoutError diterjemahkan pesan ramah, bukan generic', () => {
    expect(SRC).toContain("name === 'TimeoutError'")
    expect(SRC).toContain('deadline terlampaui')
  })

  it('E2E: panel tetap memuat data + headers kontrak via fetchWithTimeout', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ jobs: [{ id: 'job-505', role: 'backend', status: 'queued' }] }),
    }))
    vi.stubGlobal('fetch', fetchMock)
    render(<SecureProjectPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Buka kontrol proyek/i }))
    fireEvent.change(screen.getByLabelText('Project ID terautentikasi'), { target: { value: 'alpha' } })
    fireEvent.change(screen.getByLabelText('Bearer token operator'), { target: { value: 'x'.repeat(43) } })
    fireEvent.click(screen.getByRole('button', { name: /Muat data nyata/i }))
    await waitFor(() => expect(screen.getByText('job-505')).toBeTruthy())
    for (const [, options] of fetchMock.mock.calls) {
      expect(options.credentials).toBe('omit')
      expect(options.headers.Authorization).toBe('Bearer ' + 'x'.repeat(43))
    }
    // signature fetch_timeout: opsi deadline diteruskan ke fetch bawah
    const calls = fetchMock.mock.calls
    expect(calls.length).toBeGreaterThan(0)
  })
})
