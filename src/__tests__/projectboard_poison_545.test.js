// Guard siklus 545 — anti-poisoning papan proyek (projectboard_data + draw).
// Bentuk sah API non-numerik (objek/array) untuk T.review/T.failed/T.pending/
// T.running/T.done tak boleh menghasilkan '[object Object]' di papan 3D:
//   - subtitle(): 'review X' / 'gagal X' dihilangkan bila tak valid;
//   - bannerParts(): chip GAGAL/REVIEW dikoersi angka atau dilewati;
//   - numCount(): satu sumber koersi jumlah (finite → bulat, selain itu null).
import { describe, it, expect } from 'vitest'
import { subtitle, bannerParts, numCount } from '../scene/parts/projectboard_data.js'

const BAD = [{ toxic: true }, ['x'], 'NaN ', () => 1]

describe('numCount (satu sumber koersi jumlah task)', () => {
  it('finite → bulat; non-finite/bentuk bebas → null', () => {
    expect(numCount(3.7)).toBe(4)
    expect(numCount('5')).toBe(5)
    expect(numCount(0)).toBe(0)
    for (const b of BAD) expect(numCount(b)).toBeNull()
    expect(numCount(NaN)).toBeNull()
    expect(numCount(Infinity)).toBeNull()
    expect(numCount(null)).toBeNull()
    expect(numCount(undefined)).toBeNull()
  })
})

describe('subtitle anti-poisoning', () => {
  it('bentuk tak sah → segmen review/gagal hilang, tanpa [object Object]', () => {
    for (const b of BAD) {
      const s = subtitle({ review: b, failed: b }, '12:00')
      expect(s).not.toContain('object')
      expect(s).not.toContain('review')
      expect(s).not.toContain('gagal')
    }
  })
  it('bentuk sah utuh', () => {
    expect(subtitle({ review: 2, failed: 1 }, '12:00'))
      .toBe('Data live · task engine + SaaS · 12:00 · review 2 · gagal 1')
    expect(subtitle({}, null)).toBe('Data live · task engine + SaaS')
  })
})

describe('bannerParts anti-poisoning', () => {
  it('bentuk tak sah → tanpa [object Object] (chip dikoersi/dilewati)', () => {
    for (const b of BAD) {
      const parts = bannerParts({ failed: b, review: b })
      for (const [txt] of parts) expect(txt).not.toContain('object')
    }
  })
  it('bentuk sah utuh', () => {
    expect(bannerParts({ failed: 2, review: 1 }).map(p => p[0]))
      .toEqual(['GAGAL 2', 'REVIEW 1'])
    expect(bannerParts({})).toEqual([])
    expect(bannerParts(null)).toEqual([])
  })
})
