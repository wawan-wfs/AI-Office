import { describe, it, expect } from 'vitest'
import { stripSegments, stripLayout, BASE_DROP_ORDER, OMNI_DROP_ORDER } from '../scene/parts/projectboard_data.js'

const snap = {
  saas: { online: true, stats: { tenants: 2, conversations: 5, messages: 9 }, tenants: [{ name: 'acme' }] },
  agents: [
    { name: 'AlphaAgent', status: 'Up' },
    { name: 'BetaAgent', status: 'Up' },
    { name: 'GammaAgent', status: 'Down' },
    { name: 'DeltaAgent', status: 'Up' },
  ],
}
const hostRes = { cpu_pct: 23, mem_total_mb: 7400, mem_available_mb: 4000, disk_pct: 60 }

const mkMeasure = budget => ({ budget, text: t => t.length * 8, gap: 10 })

describe('strip degradasi "+N lagi" opsional (siklus 549)', () => {
  it('agmore masuk drop order, sebelum segmen wajib', () => {
    expect(BASE_DROP_ORDER).toContain('agmore')
    expect(BASE_DROP_ORDER.indexOf('agmore')).toBeLessThan(BASE_DROP_ORDER.indexOf('host'))
    expect(OMNI_DROP_ORDER).toContain('agmore')
  })

  it('stripSegments menandai __drop agmore utk penanda agen tersembunyi', () => {
    const segs = stripSegments(snap, hostRes)
    expect(segs.find(s => s.txt === '+1 lagi')?.__drop).toBe('agmore')
  })

  it('budget lega: "+N lagi" & nama agen & HOST tampil', () => {
    const { kept, dropped } = stripLayout(snap, mkMeasure(4000), hostRes)
    expect(dropped).toHaveLength(0)
    const txts = kept.map(s => s.txt)
    expect(txts).toContain('+1 lagi')
    expect(txts.some(t => t.startsWith('AlphaAgent'))).toBe(true)
    expect(txts.some(t => t.startsWith('CPU'))).toBe(true)
  })

  it('budget menengah: "+N lagi" terbuang, nama agen & HOST bertahan', () => {
    const { kept, dropped } = stripLayout(snap, mkMeasure(330), hostRes)
    expect(dropped).toContain('agmore')
    const txts = kept.map(s => s.txt)
    expect(txts.some(t => t.includes('lagi'))).toBe(false)
    expect(txts.some(t => t.startsWith('AlphaAgent'))).toBe(true)
    expect(txts.some(t => t.startsWith('CPU'))).toBe(true)
  })
})
