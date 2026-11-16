// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskBoard from '../components/TaskBoard.jsx'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({ api: vi.fn() }))

describe('kanban card keyboard parity (583)', () => {
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
    api.mockImplementation((endpoint) => {
      if (endpoint === 'tasks') return Promise.resolve({ tasks: [task] })
      if (endpoint === 'tasks/7') return Promise.resolve({ ...task, desc: 'brief gateway' })
      return Promise.resolve({})
    })
    document.body.innerHTML = ''
  })

  async function openBoardInKanban() {
    render(<TaskBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Papan task' }))
    // tunggu sampai data termuat
    await waitFor(() => {
      expect(document.body.textContent).toContain('Deploy gateway v2')
    })
    // alihkan ke view Kanban
    const kanbanBtn = screen.getByRole('button', { name: 'Tampilan Papan Kolom' })
    fireEvent.click(kanbanBtn)
    await waitFor(() => {
      expect(document.body.querySelector('.kanban-card')).toBeTruthy()
    })
  }

  it('kartu kanban native button: Enter membuka detail task', async () => {
    await openBoardInKanban()
    const card = document.body.querySelector('.kanban-card')
    expect(card).toBeTruthy()
    expect(card.tagName.toLowerCase()).toBe('button')
    fireEvent.click(card)
    await waitFor(() => {
      expect(document.body.textContent).toContain('Pindah Kolom')
    })
  })

  it('badge agen di kartu kanban dapat dioperasikan via keyboard Enter untuk fokus agen', async () => {
    window.__focusAgent = vi.fn()
    await openBoardInKanban()
    const agentBtn = document.body.querySelector('.kanban-card-agent-btn')
    expect(agentBtn).toBeTruthy()
    expect(agentBtn.getAttribute('role')).toBe('button')
    expect(agentBtn.getAttribute('tabindex')).toBe('0')
    expect(agentBtn.getAttribute('aria-label')).toContain('backend-1')
    fireEvent.keyDown(agentBtn, { key: 'Enter' })
    expect(window.__focusAgent).toHaveBeenCalledWith('backend-1')
    delete window.__focusAgent
  })

  it('baris task di tampilan list memiliki aria-label dan title konsisten dengan kanban', async () => {
    render(<TaskBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Papan task' }))
    await waitFor(() => {
      expect(document.body.textContent).toContain('Deploy gateway v2')
    })
    const row = document.body.querySelector('.taskrow')
    expect(row).toBeTruthy()
    expect(row.getAttribute('type')).toBe('button')
    expect(row.getAttribute('aria-label')).toBe('Task #7: Deploy gateway v2')
    expect(row.getAttribute('title')).toBe('Buka task #7: Deploy gateway v2')
  })
})
