// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskBoard from '../components/TaskBoard.jsx'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({ api: vi.fn() }))

describe('preset creator form button a11y (584)', () => {
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

  it('form preset tag kustom: semua tombol memiliki type eksplisit', async () => {
    await openBoard()
    fireEvent.click(screen.getByRole('button', { name: 'Buat preset tag baru' }))
    const form = document.body.querySelector('form.task-preset-creator')
    expect(form).toBeTruthy()
    for (const btn of form.querySelectorAll('button')) {
      expect(btn.getAttribute('type')).not.toBeNull()
    }
    // tombol utama a11y
    const cancel = [...form.querySelectorAll('button')].find(b => b.textContent === 'Batal')
    expect(cancel.getAttribute('type')).toBe('button')
    expect(form.querySelector('button[type="submit"]')).toBeTruthy()
    // icon & color picker tombol punya aria-pressed
    for (const btn of form.querySelectorAll('.task-preset-icon-btn, .task-preset-color-btn')) {
      expect(btn.getAttribute('aria-pressed')).toBe(String(btn.classList.contains('active')))
    }
  })

  it('tombol batal div preset & aksi kreator divisi punya type eksplisit', async () => {
    await openBoard()
    fireEvent.click(screen.getByRole('button', { name: 'Buat preset divisi baru' }))
    const creator = document.body.querySelector('.div-preset-creator')
    expect(creator).toBeTruthy()
    for (const btn of creator.querySelectorAll('button')) {
      expect(btn.getAttribute('type')).toBe('button')
    }
  })
})
