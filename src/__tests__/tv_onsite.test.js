// Siklus 529 — badge agen ON-SITE di TV lounge (paritas layar lobi 528).
// tvOnsiteText(onsite, total): teks 'N/TOTAL DI KANTOR' atau null (jangan
// pernah melukis 'NaN DI KANTOR' di kanvas 3D).
import { describe, it, expect } from 'vitest';
import { tvOnsiteText, drawTvDashboard } from '../scene/parts/tv_canvas.js';

function mockCtx() {
  const ops = []; let color = null;
  const grd = { addColorStop() {} };
  const c = {
    get fillStyle() { return color }, set fillStyle(v) { color = v; ops.push({ op: 'style', v }) },
    font: '', textAlign: '', textBaseline: '',
    createLinearGradient() { return grd },
    beginPath() {}, arc() {}, fill() {},
    fillRect: (x, y, w, h) => ops.push({ op: 'rect', color, x, y, w, h }),
    fillText: (t, x, y) => ops.push({ op: 'text', color, t, x, y }),
    __ops: ops,
  };
  return c;
}
const texts = (c) => c.__ops.filter(o => o.op === 'text');
const find = (c, t) => texts(c).find(o => o.t === t);

describe('tvOnsiteText', () => {
  it('teks eksak N/TOTAL DI KANTOR', () => {
    expect(tvOnsiteText(16, 26)).toBe('16/26 DI KANTOR');
    expect(tvOnsiteText(26, 26)).toBe('26/26 DI KANTOR');
    expect(tvOnsiteText(0, 26)).toBe('0/26 DI KANTOR');
  });
  it('guard: non-finite → null (tanpa NaN di layar)', () => {
    expect(tvOnsiteText(NaN, 26)).toBeNull();
    expect(tvOnsiteText(16, NaN)).toBeNull();
    expect(tvOnsiteText(undefined, 26)).toBeNull();
    expect(tvOnsiteText(16, undefined)).toBeNull();
    expect(tvOnsiteText(Infinity, 26)).toBeNull();
  });
  it('guard: negatif / total ≤0 / onsite>total → null', () => {
    expect(tvOnsiteText(-1, 26)).toBeNull();
    expect(tvOnsiteText(5, 0)).toBeNull();
    expect(tvOnsiteText(5, -3)).toBeNull();
    expect(tvOnsiteText(27, 26)).toBeNull();
  });
  it('float dibulatkan ke bawah (floor), bukan pecahan di layar', () => {
    expect(tvOnsiteText(15.7, 26)).toBe('15/26 DI KANTOR');
  });
});

describe('drawTvDashboard × onsite', () => {
  it('badge digambar di baris stempel (kanan, warna hijau)', () => {
    const c = mockCtx();
    drawTvDashboard(c, { tasks: { total: 1, done: 1 }, agents: [] },
      { now: 0, onsite: 16, onsiteTotal: 26 });
    const b = find(c, '16/26 DI KANTOR');
    expect(b).toBeTruthy();
    expect(b.color).toBe('#10E5A0'); // TV_GREEN
    expect(b.x).toBe(244); // TV_W-12, align right
  });
  it('tanpa opts.onsite → badge TIDAK digambar (kompatibilitas pemanggil lama)', () => {
    const c = mockCtx();
    drawTvDashboard(c, { tasks: { total: 1, done: 1 }, agents: [] }, { now: 0 });
    expect(texts(c).some(o => o.t.includes('DI KANTOR'))).toBe(false);
  });
  it('onsite racun (NaN) → tidak melukis NaN', () => {
    const c = mockCtx();
    drawTvDashboard(c, { tasks: { total: 1, done: 1 }, agents: [] },
      { now: 0, onsite: NaN, onsiteTotal: 26 });
    expect(texts(c).some(o => o.t.includes('NaN'))).toBe(false);
  });
});
