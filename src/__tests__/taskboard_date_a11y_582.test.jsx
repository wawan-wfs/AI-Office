// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import TaskBoard from '../components/TaskBoard'

afterEach(() => cleanup())

// Siklus 582: a11y input tanggal kustom TaskBoard — validasi rentang terbalik
// kini diumumkan screen reader (aria-invalid + describedby per input).
function openBoard() {
  const { getByLabelText, baseElement } = render(<TaskBoard />)
  fireEvent.click(getByLabelText('Papan task'))
  return { getByLabelText, baseElement }
}

describe('TaskBoard custom date a11y (siklus 582)', () => {
  it('input tanggal tanpa error: aria-invalid false/absen, tanpa describedby', () => {
    const { getByLabelText } = openBoard()
    fireEvent.click(getByLabelText('Rentang waktu task'))
    fireEvent.change(getByLabelText('Rentang waktu task'), { target: { value: 'custom' } })
    const s = getByLabelText('Tanggal awal kustom')
    const e = getByLabelText('Tanggal akhir kustom')
    expect(s.getAttribute('aria-invalid')).not.toBe('true')
    expect(e.getAttribute('aria-describedby')).toBeNull()
  })

  it('rentang terbalik: kedua input aria-invalid=true dan describedby ke tb-date-err role=alert', () => {
    const { getByLabelText, baseElement } = openBoard()
    const sel = getByLabelText('Rentang waktu task')
    fireEvent.change(sel, { target: { value: 'custom' } })
    fireEvent.change(getByLabelText('Tanggal awal kustom'), { target: { value: '2026-11-20' } })
    fireEvent.change(getByLabelText('Tanggal akhir kustom'), { target: { value: '2026-11-10' } })
    const s = getByLabelText('Tanggal awal kustom')
    const e = getByLabelText('Tanggal akhir kustom')
    expect(s.getAttribute('aria-invalid')).toBe('true')
    expect(e.getAttribute('aria-invalid')).toBe('true')
    expect(s.getAttribute('aria-describedby')).toBe('tb-date-err')
    expect(e.getAttribute('aria-describedby')).toBe('tb-date-err')
    const alert = baseElement.querySelector('#tb-date-err')
    expect(alert).not.toBeNull()
    expect(alert.getAttribute('role')).toBe('alert')
  })

  it('diperbaiki: aria-invalid kembali false dan describedby null', () => {
    const { getByLabelText } = openBoard()
    const sel = getByLabelText('Rentang waktu task')
    fireEvent.change(sel, { target: { value: 'custom' } })
    const s = getByLabelText('Tanggal awal kustom')
    const e = getByLabelText('Tanggal akhir kustom')
    fireEvent.change(s, { target: { value: '2026-11-20' } })
    fireEvent.change(e, { target: { value: '2026-11-10' } })
    expect(s.getAttribute('aria-invalid')).toBe('true')
    fireEvent.change(e, { target: { value: '2026-11-25' } })
    expect(s.getAttribute('aria-invalid')).not.toBe('true')
    expect(s.getAttribute('aria-describedby')).toBeNull()
    expect(e.getAttribute('aria-describedby')).toBeNull()
  })
})
