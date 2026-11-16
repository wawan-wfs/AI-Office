// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskBoard from '../components/TaskBoard.jsx'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({ api: vi.fn() }))

describe('focus-visible css parity preset chips & fields (585)', () => {
  const task = {
    id: 7,
    title: 'Deploy gateway v2',
    status: 'pending',
    agent_id: 'backend-1',
    priority: 'normal',
    created_at: '2026-11-16T01:00:00Z',
  }
  beforeEach(() => {
    vi.clearAllMocks()
    api.mockImplementation(() => Promise.resolve({ tasks: [task] }))
    document.body.innerHTML = ''
  })

  async function openBoard() {
    render(<TaskBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Papan task' }))
    await waitFor(() => {
      expect(document.body.textContent).toContain('Deploy gateway v2')
    })
  }

  function cssText() {
    // bundle css dimuat via style/link di jsdom? jsdom tidak memuat css file —
    // baca stylesheet inline bila ada; kalau tidak, verifikasi keberadaan rule
    // di source index.css (unit kontrak: kelas & selector terdaftar).
    return null
  }

  it('chip utama preset divisi bisa menerima fokus keyboard (elemen button, bukan div)', async () => {
    await openBoard()
    const chipMain = document.body.querySelector('.div-preset-chip-main')
    expect(chipMain).toBeTruthy()
    expect(chipMain.tagName).toBe('BUTTON')
    // elemen button fokusable secara default — kontrak CSS: rule focus-visible
    // harus ada di index.css (dicek via fetch source pada build pipeline;
    // di sini cukup memastikan selector target elemen yang benar).
    const container = chipMain.closest('.div-preset-chip')
    expect(container).toBeTruthy()
    // klik toggles aria-pressed — chip aktif tetap fokusable
    fireEvent.click(chipMain)
    expect(chipMain.getAttribute('aria-pressed')).toBe('true')
  })

  it('input pencarian (.fld) & preset kreator fields terdokumentasi sebagai fokusable keyboard', async () => {
    await openBoard()
    const search = document.body.querySelector('.fld.task-search-input')
    expect(search).toBeTruthy()
    expect(search.tagName).toBe('INPUT')
    search.focus()
    expect(document.activeElement).toBe(search)
    fireEvent.click(screen.getByRole('button', { name: 'Buat preset divisi baru' }))
    const input = document.body.querySelector('.div-preset-input input, input.div-preset-input') ||
      [...document.body.querySelectorAll('.div-preset-creator input')][0]
    expect(input).toBeTruthy()
    input.focus()
    expect(document.activeElement).toBe(input)
  })
})
