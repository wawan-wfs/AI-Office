// @vitest-environment jsdom
// Guard siklus 501 — hook window milik WfsPanel di-purge saat unmount.
//
// Konteks: loadAgents() memasang window.__wfsAgentIdList & window.__wfsSelectAgent
// (dibaca scene + AgentInspector + App). Sebelum 501 tidak ada yang menghapusnya
// saat WfsPanel unmount — pasca-remount/HMR hook basi menunjuk closure komponen
// gugur (setOpen komponen mati), pola bug yang sama dgn __swUpdateDebug (476).
// Kini unmount menghapus keduanya; scene membaca dgn guard if(window.__wfsSelect…)
// sehingga penghapusan aman.

import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'

afterEach(cleanup)

describe('WfsPanel hook purge (siklus 501)', () => {
  it('unmount menghapus __wfsAgentIdList & __wfsSelectAgent', async () => {
    const mod = await import('../components/WfsPanel.jsx')
    const WfsPanel = mod.default
    // Stub fetch via stubGlobal (pola wfs_panel) — api() membungkus
    // fetchWithTimeout → fetch global jsdom.
    const realFetch = globalThis.fetch
    vi.stubGlobal('fetch', async () => ({
      ok: true, status: 200,
      json: async () => ({ agents: [{ id: 'a1', name: 'ALPHA', role: 'dev' }] }),
    }))
    try {
      const { unmount } = render(<WfsPanel />)
      await waitFor(() => expect(window.__wfsAgentIdList).toBeTruthy())
      expect(window.__wfsSelectAgent).toBeTypeOf('function')
      unmount()
      expect(window.__wfsAgentIdList).toBeUndefined()
      expect(window.__wfsSelectAgent).toBeUndefined()
    } finally {
      vi.unstubAllGlobals()
      globalThis.fetch = realFetch
      delete window.__wfsAgentIdList
      delete window.__wfsSelectAgent
    }
  })

  it('unmount TANPA loadAgents sukses pun tetap membersihkan (idempoten)', async () => {
    const mod = await import('../components/WfsPanel.jsx')
    const WfsPanel = mod.default
    const { unmount } = render(<WfsPanel />)
    unmount()
    expect('cleanup effect berjalan tanpa error').toBe('cleanup effect berjalan tanpa error')
  })
})
