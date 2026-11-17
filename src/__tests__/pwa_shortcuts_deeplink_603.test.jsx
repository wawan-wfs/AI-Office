// @vitest-environment jsdom
// Siklus 603 — PWA shortcuts & deep-link routing terpadu.
// Menggate:
// 1. Manifest PWA di vite.config.js & dist/manifest.webmanifest memiliki shortcuts lengkap (4 aksi).
// 2. Setiap icon shortcut mengarah ke file statis valid yang ada di dist/.
// 3. App.jsx mendukung deep-link hash (#dashboard, #tasks, #console, #project) dan membersihkan hash on-mount.

import React from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(__dirname, '../..')
const viteSrc = readFileSync(resolve(root, 'vite.config.js'), 'utf8')
const appSrc = readFileSync(resolve(root, 'src/App.jsx'), 'utf8')

const mockSceneInstance = {
  isAudioMuted: vi.fn(() => false),
  setAudioMuted: vi.fn(),
  playTaskDone: vi.fn(),
  playTaskFail: vi.fn(),
  playSelect: vi.fn(),
  isCyberpunk: () => false,
  toggleCyberpunk: vi.fn(),
  setTime: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  setView: vi.fn(),
  destroy: vi.fn(),
}

vi.mock('../scene/OfficeScene', () => ({
  createOfficeScene: vi.fn(() => mockSceneInstance),
}))

import App from '../App'

function stubFetch(tasks = []) {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    const u = String(url)
    if (u.includes('tasks/paused')) return { ok: true, json: async () => ({ paused: false }) }
    if (u.includes('/tasks') || u.endsWith('/tasks')) return { ok: true, json: async () => ({ tasks }) }
    return { ok: true, json: async () => ({}) }
  }))
}

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  try { localStorage.clear() } catch { /* noop */ }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Siklus 603 — PWA Web App Manifest shortcuts', () => {
  it('vite.config.js mendeklarasikan 4 shortcuts PWA', () => {
    expect(viteSrc).toContain('shortcuts: [')
    expect(viteSrc).toContain('name: \'Papan Task\'')
    expect(viteSrc).toContain('name: \'Dashboard Overview\'')
    expect(viteSrc).toContain('name: \'Konsol Software House\'')
    expect(viteSrc).toContain('name: \'Proyek dibantuin.com\'')
  })

  it('dist/manifest.webmanifest membawa shortcuts dan semua icon ter-deploy', () => {
    const manifestPath = resolve(root, 'dist/manifest.webmanifest')
    expect(existsSync(manifestPath)).toBe(true)
    const m = JSON.parse(readFileSync(manifestPath, 'utf8'))
    expect(Array.isArray(m.shortcuts)).toBe(true)
    expect(m.shortcuts.length).toBe(4)

    for (const sc of m.shortcuts) {
      expect(sc.name).toBeTruthy()
      expect(sc.url).toBeTruthy()
      expect(Array.isArray(sc.icons)).toBe(true)
      for (const icon of sc.icons) {
        expect(icon.src.startsWith('/')).toBe(true)
        const rel = icon.src.replace(/^\//, '')
        expect(existsSync(resolve(root, 'dist', rel))).toBe(true)
      }
    }
  })
})

describe('Siklus 603 — Deep-link hash routing on-mount di App.jsx', () => {
  it('App.jsx memiliki logika penanganan hash terpadu', () => {
    expect(appSrc).toContain('#tasks')
    expect(appSrc).toContain('#console')
    expect(appSrc).toContain('#project')
    expect(appSrc).toContain('#dashboard')
  })

  it('hash #dashboard membuka dialog Dashboard dan membersihkan hash URL', async () => {
    window.history.replaceState(null, '', '/app/#dashboard')
    stubFetch()
    render(<App />)
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Dashboard' })).toBeTruthy(), { timeout: 3000 })
    expect(window.location.hash).toBe('')
  })

  it('hash #console membuka ShConsole drawer dan membersihkan hash URL', async () => {
    window.history.replaceState(null, '', '/app/#console')
    stubFetch()
    render(<App />)
    await waitFor(() => expect(screen.getByRole('dialog', { name: /Konsol Software House/i })).toBeTruthy(), { timeout: 3000 })
    expect(window.location.hash).toBe('')
  })

  it('hash #project memicu event wfs-toggle-project-panel dan membersihkan hash URL', async () => {
    let triggered = false
    const onToggle = () => { triggered = true }
    window.addEventListener('wfs-toggle-project-panel', onToggle)
    try {
      window.history.replaceState(null, '', '/app/#project')
      stubFetch()
      render(<App />)
      await waitFor(() => expect(triggered).toBe(true), { timeout: 3000 })
      expect(window.location.hash).toBe('')
    } finally {
      window.removeEventListener('wfs-toggle-project-panel', onToggle)
    }
  })
})
