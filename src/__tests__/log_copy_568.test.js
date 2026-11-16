// Siklus 568: formatLogText — builder teks log aktivitas (tombol "Salin").
// Murni, tanpa clipboard; ActivityLog yang memanggil navigator.clipboard.
import { describe, it, expect } from 'vitest'
import { formatLogText } from '../lib/storage_prefs.js'

const e = (id, status, label = status, t = '10.00.15', title = 'x') =>
  ({ t, id, status, label, title })

describe('formatLogText (siklus 568)', () => {
  it('format baris: stempel | label | #id title', () => {
    const out = formatLogText([e(7, 'done', 'selesai', 1700000000000, 'deploy')])
    expect(out).toContain('selesai')
    expect(out).toContain('#7 deploy')
    expect(out).toContain('|')
    expect(out.split('\n')).toHaveLength(1)
  })

  it('multi baris, urutan log dipertahankan', () => {
    const out = formatLogText([e(7, 'done'), e(5, 'running')])
    expect(out.split('\n')).toHaveLength(2)
    expect(out.split('\n')[0]).toContain('#7')
    expect(out.split('\n')[1]).toContain('#5')
  })

  it('baris kembar identik dihilangkan dari teks', () => {
    const out = formatLogText([e(7, 'done', 'selesai', '10.00.15', 'x'), e(7, 'done', 'selesai', '10.00.15', 'x')])
    expect(out.split('\n')).toHaveLength(1)
  })

  it('guard: bukan array / kosong → string kosong', () => {
    expect(formatLogText(null)).toBe('')
    expect(formatLogText([])).toBe('')
  })

  it('item rusak (null / tanpa id / stempel 0) → tetap satu baris, tanpa crash', () => {
    const out = formatLogText([null, e(null, 'done'), e(9, 'done', 'selesai', 0)])
    expect(out.split('\n')).toHaveLength(3)
    expect(out).toContain('[?]')
  })
})
