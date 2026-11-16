// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ShConsole from '../components/ShConsole.jsx'

// Siklus 586: semua <button> di ShConsole eksplisit type="button" —
// default implisit "submit" hanya relevan di dalam <form>, tapi konsistensi
// dengan pola TaskBoard/TaskModal (siklus 584) mencegah kejutan kalau markup
// kelak dibungkus form; screen reader & testing-library juga lebih deterministik.
const SRC = readFileSync(resolve(process.cwd(), 'src/components/ShConsole.jsx'), 'utf8')

describe('ShConsole button type compliance (586)', () => {
  it('tidak ada <button> tanpa type eksplisit di source', () => {
    const buttons = SRC.match(/<button[^>]*>/g) || []
    expect(buttons.length).toBeGreaterThan(0)
    for (const tag of buttons) expect(tag).toMatch(/\btype="/)
  })

  it('tombol utama tab & task ter-render dan berfungsi (type button)', () => {
    render(<ShConsole show onClose={() => {}} />)
    const tab = screen.getByRole('button', { name: 'Tab Overview' })
    expect(tab.getAttribute('type')).toBe('button')
    fireEvent.click(screen.getByRole('button', { name: 'Tab Tasks' }))
    expect(screen.getByRole('button', { name: 'Tambah task' }).getAttribute('type')).toBe('button')
  })
})
