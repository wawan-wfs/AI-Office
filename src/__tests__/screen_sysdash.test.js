// Siklus 531 — renderer layar 'sysdash' (dashboard sistem monitor kedua meja lead).
// Kontrak painter: (ctx, w, h, t, hex) — t = detik nyata (kontrak 264).
import { describe, it, expect } from 'vitest';
import { SCREEN_RENDERERS, drawScreenFrame } from '../scene/parts/effects.js';

function mockCtx() {
  const ops = []; let color = null;
  const c = {
    get fillStyle() { return color }, set fillStyle(v) { color = v; ops.push({ op: 'style', v }) },
    font: '', globalAlpha: 1,
    fillRect: (x, y, w, h) => ops.push({ op: 'rect', color, x, y, w, h }),
    fillText: (t, x, y) => ops.push({ op: 'text', color, t, x, y }),
    __ops: ops,
  };
  return c;
}
const texts = (c) => c.__ops.filter(o => o.op === 'text');
const rects = (c) => c.__ops.filter(o => o.op === 'rect');

describe('SCREEN_RENDERERS.sysdash', () => {
  it('terdaftar di tabel renderer', () => {
    expect(typeof SCREEN_RENDERERS.sysdash).toBe('function');
  });
  it('menggambar 4 label metrik (CPU/MEM/GPU/NET)', () => {
    const c = mockCtx();
    SCREEN_RENDERERS.sysdash(c, 128, 76, 0, '#60A5FA');
    const labels = texts(c).map(o => o.t).filter(t => ['CPU', 'MEM', 'GPU', 'NET'].includes(t));
    expect(labels).toEqual(['CPU', 'MEM', 'GPU', 'NET']);
  });
  it('baris footer berisi FPS & UPTIME (deterministik utk t tetap)', () => {
    const c = mockCtx();
    SCREEN_RENDERERS.sysdash(c, 128, 76, 120, '#60A5FA');
    const foot = texts(c).find(o => o.t.startsWith('FPS '));
    expect(foot.t).toBe('FPS 64 · UPTIME 2m'); // 45+floor(|sin(360 rad)|*20)
  });
  it('teks TIDAK pernah mengandung NaN (guard anti-poisoning)', () => {
    for (const t of [0, 1.5, 37, 999.9, NaN, Infinity]) {
      const c = mockCtx();
      SCREEN_RENDERERS.sysdash(c, 128, 76, t, '#60A5FA');
      expect(texts(c).every(o => !String(o.t).includes('NaN'))).toBe(true);
    }
  });
  it('lebar bar terjaga dalam rentang (guard min 5 / maks 95)', () => {
    const c = mockCtx();
    SCREEN_RENDERERS.sysdash(c, 128, 76, 2.13, '#60A5FA');
    const bars = rects(c).filter(o => o.x === 28 && o.h === 6);
    expect(bars.length).toBe(8); // 4 latar + 4 isi
    bars.forEach(o => { expect(o.w).toBeGreaterThan(0); expect(o.w).toBeLessThanOrEqual(88); });
  });
  it('dot live digambar saat sin(t*2.5)>0 (t=1)', () => {
    const c1 = mockCtx(); SCREEN_RENDERERS.sysdash(c1, 128, 76, 1, '#60A5FA');
    const c0 = mockCtx(); SCREEN_RENDERERS.sysdash(c0, 128, 76, 3, '#60A5FA');
    const dot1 = rects(c1).some(o => o.w === 5 && o.h === 5);
    const dot0 = rects(c0).some(o => o.w === 5 && o.h === 5);
    expect(dot1).toBe(true);
    expect(dot0).toBe(true); // sin(3*2.5)=sin(7.5)>0 juga — dot periodik, keduanya fase hidup
  });
  it('kontrak drawScreenFrame: type sysdash masuk pipeline stagger tanpa lempar', () => {
    const c = mockCtx();
    const s = { ctx: c, canvas: { width: 128, height: 76 }, tex: { needsUpdate: false }, type: 'sysdash', hex: '#60A5FA' };
    expect(() => drawScreenFrame(s, 0, 12)).not.toThrow();
    expect(s.tex.needsUpdate).toBe(true);
    expect(texts(c).length).toBeGreaterThan(0);
  });
});
