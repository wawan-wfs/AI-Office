// @vitest-environment jsdom
// Siklus 561/562: badge unread tombol dock "Log" (ActivityBadge).
// Cakupan: useUnreadActivity menghitung item belum dilihat (per-ID seen,
// bukan timestamp global), reset saat dialog dibuka (open), ActivityBadge
// merender/merender-null, guard storage korup.
import React from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import { ActivityBadge, useUnreadActivity, activityMarkSeen, activitySeenIds, SEEN_KEY } from '../components/ActivityBadge'

afterEach(() => { cleanup(); localStorage.clear(); document.body.innerHTML = '' })

const LOG_KEY = 'wfs_activity'
const item = (id, extra = {}) => ({ t: '10.00', status: 'done', id, title: 'x', ...extra })

// hook di-host komponen dummy (renderHook butuh wrapper react)
function Host({ open }) {
  const n = useUnreadActivity(open)
  return <div data-testid="n">{n}</div>
}

describe('ActivityBadge unread (per-ID seen)', () => {
  it('menghitung item log belum dilihat (clamp 9)', () => {
    const items = Array.from({ length: 12 }, (_, i) => item(i))
    localStorage.setItem(LOG_KEY, JSON.stringify(items))
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('9')
  })

  it('badge nol saat log kosong', () => {
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('0')
  })

  it('membuka dialog menandai terlihat → count reset', () => {
    localStorage.setItem(LOG_KEY, JSON.stringify([item(1)]))
    const { getByTestId, rerender } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('1')
    rerender(<Host open />)
    expect(getByTestId('n').textContent).toBe('0')
    expect(activitySeenIds()).toEqual(['1'])
  })

  it('item baru setelah dialog pernah dibuka TETAP memunculkan badge (fix 561)', () => {
    localStorage.setItem(LOG_KEY, JSON.stringify([item(1)]))
    const { getByTestId, rerender } = render(<Host open={false} />)
    rerender(<Host open />) // dibuka sekali → id 1 seen
    expect(getByTestId('n').textContent).toBe('0')
    rerender(<Host open={false} />) // ditutup kembali (realistis)
    localStorage.setItem(LOG_KEY, JSON.stringify([item(1), item(2)]))
    act(() => { window.dispatchEvent(new CustomEvent('wfs-activity-updated')) })
    expect(getByTestId('n').textContent).toBe('1') // hanya id 2 yang unread
  })

  it('item baru saat dialog SEDANG terbuka → badge tetap 0 & item di-mark seen (fix 564)', () => {
    localStorage.setItem(LOG_KEY, JSON.stringify([item(1)]))
    const { getByTestId, rerender } = render(<Host open />)
    expect(getByTestId('n').textContent).toBe('0')
    localStorage.setItem(LOG_KEY, JSON.stringify([item(1), item(2)]))
    act(() => { window.dispatchEvent(new CustomEvent('wfs-activity-updated')) })
    expect(getByTestId('n').textContent).toBe('0') // dialog terbuka → tak ada badge
    expect(activitySeenIds()).toContain('2')       // item terlihat di dialog → seen
    // setelah ditutup, item yang sudah dilihat tetap tidak memunculkan badge
    rerender(<Host open={false} />)
    act(() => { window.dispatchEvent(new CustomEvent('wfs-activity-updated')) })
    expect(getByTestId('n').textContent).toBe('0')
  })

  it('event wfs-activity-updated memicu hitung ulang', () => {
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('0')
    localStorage.setItem(LOG_KEY, JSON.stringify([item(1)]))
    act(() => { window.dispatchEvent(new CustomEvent('wfs-activity-updated')) })
    expect(getByTestId('n').textContent).toBe('1')
  })

  it('event storage (tab lain) juga memicu hitung ulang', () => {
    const { getByTestId } = render(<Host open={false} />)
    localStorage.setItem(LOG_KEY, JSON.stringify([item(7)]))
    act(() => { window.dispatchEvent(new StorageEvent('storage')) })
    expect(getByTestId('n').textContent).toBe('1')
  })

  it('markSeen menyimpan semua id log saat ini', () => {
    localStorage.setItem(LOG_KEY, JSON.stringify([item(1), item(2)]))
    activityMarkSeen()
    expect(activitySeenIds()).toEqual(['1', '2'])
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('0')
  })

  it('seen cap 200: id lama tergeser, id baru tetap terbaca (badge muncul)', () => {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from({ length: 210 }, (_, i) => String(i))))
    activityMarkSeen() // log kosong → tak menambah; set seen 210 id
    localStorage.setItem(LOG_KEY, JSON.stringify(Array.from({ length: 50 }, (_, i) => item(300 + i))))
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('9')
  })

  it('guard: seen korup / bukan array → diabaikan (tetap unread)', () => {
    localStorage.setItem(SEEN_KEY, '{korup')
    localStorage.setItem(LOG_KEY, JSON.stringify([item(1)]))
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('1')
  })

  it('guard: item tanpa id dihitung unread (tidak hilang diam-diam)', () => {
    localStorage.setItem(LOG_KEY, JSON.stringify([{ t: '10.00', status: 'done', title: 'no-id' }]))
    const { getByTestId } = render(<Host open={false} />)
    expect(getByTestId('n').textContent).toBe('1')
  })

  it('guard: log korup → badge 0, tanpa crash', () => {
    localStorage.setItem(LOG_KEY, '{korup')
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
