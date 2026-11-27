// Siklus 519 — Guard anti-poisoning string turunan Ticker:
// teks ticker task (agent_id/status mentah) & string aria-live
// (liveText/livePresence) harus dinormalisasi — bentuk sah API
// non-string tidak boleh jadi "[object Object]" di screen reader
// maupun teks berjalan.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (p) => readFileSync(resolve(__dirname, '../..', p), 'utf8')

describe('ticker_text_poison_519 — Ticker string turunan', () => {
  const ticker = read('src/components/Ticker.jsx')

  it('teks ticker task tidak memakai x.status mentah & agent_id fallback dinormalisasi', () => {
    expect(ticker).not.toMatch(/\[\$\{x\.status\}\]/)
    expect(ticker).not.toMatch(/name\[x\.agent_id\] \|\| x\.agent_id\)\s*:\s*'Tanpa agen'/)
    expect(ticker).toMatch(/normalizeClipText\(name\[x\.agent_id\] \|\| x\.agent_id\)/)
    expect(ticker).toMatch(/normalizeClipText\(x\.status\)/)
  })

  it('liveText & livePresence (aria-live) dibangun dari nilai dinormalisasi', () => {
    expect(ticker).not.toMatch(/conn && conn\.label/)
    expect(ticker).not.toMatch(/`\$\{s\.count\} \$\{s\.label\}`/)
    expect(ticker).toMatch(/normalizeClipText\(conn\.label\)/)
    expect(ticker).toMatch(/normalizeClipText\(s\.count\)/)
    expect(ticker).toMatch(/normalizeClipText\(s\.label\)/)
  })

  it('tidak ada interpolasi mentah field API tersisa di Ticker', () => {
    // sweep: pola ${x.<field>} / ${s.<field>} / ${conn.<field>} tanpa pembungkus
    const raw = ticker.match(/\$\{(x|s|conn)\.[a-z_]+\}/g) || []
    expect(raw).toEqual([])
  })
})
