// @vitest-environment jsdom
// Siklus 574: SettingsModal aria-describedby — deskripsi pengantar dialog
// terasosiasi ke role=dialog (pola cf-d ConfirmModal siklus 572).
import { describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import SettingsModal from '../components/SettingsModal.jsx'
import { afterEach } from 'vitest'

afterEach(() => { cleanup(); document.body.innerHTML = '' })

describe('SettingsModal aria-describedby (siklus 574)', () => {
  it('dialog punya aria-describedby=sm-desc dan teks deskripsi ada', () => {
    render(<SettingsModal show onClose={() => {}} sceneRef={{ current: null }} />)
    const dlg = screen.getByRole('dialog')
    expect(dlg.getAttribute('aria-describedby')).toBe('sm-desc')
    const desc = document.getElementById('sm-desc')
    expect(desc).not.toBeNull()
    expect(desc.textContent).toMatch(/audio/i)
    expect(dlg.contains(desc)).toBe(true)
  })

  it('title tetap sm-title (labelledby tidak berubah)', () => {
    render(<SettingsModal show onClose={() => {}} sceneRef={{ current: null }} />)
    expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe('sm-title')
  })
})
