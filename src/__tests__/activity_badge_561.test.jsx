// @vitest-environment jsdom
// Siklus 561: badge unread tombol dock "Log" (ActivityBadge).
// Cakupan: useUnreadActivity menghitung item belum dilihat, reset saat dialog
// dibuka (open), ActivityBadge merender/merender-null.
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, renderHook, act } from '@testing-library/react'
import { ActivityBadge, useUnreadActivity, activityMarkSeen } from '../components/ActivityBadge'

afterEach(() => { cleanup(); localStorage.clear(); document.body.innerHTML = '' })

// hook di-host komponen dummy (renderHook butuh wrapper react)
function Host({ open }) {
  const n = useUnreadActivity(open)
  return <div data-testid="n">{n}</div>
}

describe('ActivityBadge unread', () => {
  it('menghitung item log belum dilihat (min 9)', () => {
    const items = Array.from({ length: 12 }, (_, i) => ({ t: '10.00', status: 'done', id: i, title: 'x' }))
    localStorage.setItem('wfs_activity', JSON.stringify(items))
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('9')
  })

  it('badge nol saat log kosong', () => {
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('0')
  })

  it('membuka dialog menandai terlihat → count reset', () => {
    const items = [{ t: '10.00', status: 'done', id: 1, title: 'x' }]
    localStorage.setItem('wfs_activity', JSON.stringify(items))
    const { getByTestId, rerender } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('1')
    rerender(<Host open />)
    expect(getByTestId('n').textContent).toBe('0')
  })

  it('event wfs-activity-updated memicu hitung ulang', () => {
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('0')
    localStorage.setItem('wfs_activity', JSON.stringify([{ t: '10.00', status: 'done', id: 1, title: 'x' }]))
    act(() => { window.dispatchEvent(new CustomEvent('wfs-activity-updated')) })
    expect(getByTestId('n').textContent).toBe('1')
  })

  it('seen sebelumnya → tanpa badge walau ada item', () => {
    localStorage.setItem('wfs_activity', JSON.stringify([{ t: '10.00', status: 'done', id: 1, title: 'x' }]))
    activityMarkSeen()
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('0')
  })

  it('ActivityBadge merender angka / null', () => {
    const { container, rerender } = render(<ActivityBadge count={4} />)
    expect(container.querySelector('.log-badge').textContent).toBe('4')
    rerender(<ActivityBadge count={0} />)
    expect(container.querySelector('.log-badge')).toBeNull()
  })
})
