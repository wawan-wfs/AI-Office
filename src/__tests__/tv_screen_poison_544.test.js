import { describe, it, expect } from 'vitest'
import { drawTvDashboard, statusRows } from '../scene/parts/tv_canvas.js'

function stubCtx() {
  const calls = []
  const mk = () => new Proxy({}, { get: (t, p) => {
    if (p === 'measureText') return () => ({ width: 10 })
    if (p === 'createLinearGradient') return () => ({ addColorStop() {} })
    if (p === 'fillText') return (...a) => calls.push(String(a[0]))
    if (p === 'arc' || p === 'beginPath' || p === 'fillRect') return () => {}
    if (p === 'fillStyle' || p === 'font' || p === 'textAlign' || p === 'textBaseline') return undefined
    return undefined
  }, set: () => true })
  return { ctx: mk(), calls }
}

const TOXIC = [{ to: 'xic' }, ['arr'], () => 1, 'ok', null, undefined]

describe('TV screen anti-poisoning (544)', () => {
  it('statusRows tak menghasilkan [object Object] untuk bentuk tak sah', () => {
    for (const v of TOXIC) {
      for (const rows of [statusRows({ failed: v, review: v }), statusRows({ review: v })]) {
        for (const r of rows) expect(r.text).not.toContain('object Object')
      }
    }
  })

  it('drawTvDashboard tanpa [object Object] pada 4 bentuk tak sah', () => {
    for (const bad of [{ to: 'xic' }, ['arr'], () => 1, Symbol('s')]) {
      const { ctx, calls } = stubCtx()
      drawTvDashboard(ctx, {
        tasks: { total: 10, done: 4, failed: bad, review: bad },
        agents: [{ name: bad, status: 'Up' }],
      }, { now: 1700000000000 })
      for (const c of calls) expect(c).not.toContain('object Object')
    }
  })

  it('bentuk sah tetap utuh', () => {
    const rows = statusRows({ failed: 2, review: 3 })
    expect(rows[0].text).toBe('GAGAL: 2')
    expect(rows[1].text).toBe('REVIEW: 3')
    const { ctx, calls } = stubCtx()
    drawTvDashboard(ctx, {
      tasks: { total: 10, done: 4, failed: 2, review: 3 },
      agents: [{ name: 'PM', status: 'Up' }],
    }, { now: 1700000000000 })
    expect(calls.some(c => c.includes('REVIEW: 3'))).toBe(true)
    expect(calls.some(c => c.includes('PM●'))).toBe(true)
  })
})
