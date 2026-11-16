// @vitest-environment jsdom
// Siklus 575: TaskModal fokus awal ke input Judul + aria-describedby dialog ke error.
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react'
import TaskModal from '../components/TaskModal.jsx'

vi.mock('../lib/api', () => ({ api: vi.fn() }))

const h = React.createElement

afterEach(() => { cleanup(); document.body.innerHTML = ''; vi.clearAllMocks() })

describe('TaskModal fokus & describedby (siklus 575)', () => {
  const base = { show: true, onClose: vi.fn(), onDone: vi.fn() }

  it('dialog terbuka → fokus langsung di input Judul (bukan tombol tutup)', async () => {
    render(h(TaskModal, base))
    await act(() => new Promise(r => setTimeout(r, 60)))
    expect(document.activeElement).toBe(screen.getByLabelText('Judul'))
  })

  it('error judul → dialog aria-describedby menunjuk tm-err; tanpa error → null', async () => {
    render(h(TaskModal, base))
    const dlg = screen.getByRole('dialog')
    expect(dlg.getAttribute('aria-describedby')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(dlg.getAttribute('aria-describedby')).toBe('tm-err')
    expect(document.getElementById('tm-err').textContent).toContain('Judul task wajib diisi')
  })
})
