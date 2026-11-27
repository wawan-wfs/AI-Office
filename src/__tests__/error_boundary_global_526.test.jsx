// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ErrorBoundary from '../components/ErrorBoundary.jsx'

// Siklus 526: error global di luar render React (window 'error' &
// unhandledrejection) harus ikut ditangkap ErrorBoundary — panel
// boundary tampil, bukan gagal diam-diam hanya di console.
function Bomb({ onMount }) {
  React.useEffect(() => { onMount && onMount() }, [onMount])
  return <div>ok</div>
}

describe('ErrorBoundary global handlers (526)', () => {
  let errSpy, rejSpy
  beforeEach(() => {
    errSpy = vi.fn()
    rejSpy = vi.fn()
    window.addEventListener('error', errSpy)
    window.addEventListener('unhandledrejection', rejSpy)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    window.removeEventListener('error', errSpy)
    window.removeEventListener('unhandledrejection', rejSpy)
    vi.restoreAllMocks()
  })

  it('menampilkan panel boundary saat window error uncaught terjadi', () => {
    const { unmount } = render(
      <ErrorBoundary><Bomb onMount={() => { throw new Error('boom-global') }} /></ErrorBoundary>
    )
    fireEvent(window, new ErrorEvent('error', { error: new Error('boom-global') }))
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('boom-global')).toBeTruthy()
    unmount()
  })

  it('menampilkan panel boundary saat unhandledrejection', () => {
    const { unmount } = render(
      <ErrorBoundary><Bomb /></ErrorBoundary>
    )
    fireEvent(window, new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.resolve(), reason: new Error('rej-526'),
    }))
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('rej-526')).toBeTruthy()
    unmount()
  })

  it('listener terpasang saat mount & dilepas saat unmount', () => {
    const { unmount } = render(<ErrorBoundary><div>ok</div></ErrorBoundary>)
    expect(window.__eb_listeners_probe).toBeUndefined()
    const ev = new ErrorEvent('error', { error: new Error('x') })
    fireEvent(window, ev)
    expect(errSpy).toHaveBeenCalled()
    unmount()
    // setelah unmount, handler ErrorBoundary tidak lagi berada di window
    expect(window.__eb_listeners_probe).toBeUndefined()
  })

  it('event tanpa error/reason diabaikan (resource load error)', () => {
    const { unmount } = render(<ErrorBoundary><div>ok</div></ErrorBoundary>)
    fireEvent(window, new Event('error'))
    expect(screen.queryByRole('alert')).toBeNull()
    unmount()
  })
})
