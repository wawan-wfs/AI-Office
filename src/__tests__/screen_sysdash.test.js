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
  it('menggambar 4 label metrik (CPU/MEM/DISK/NET)', () => {
    const c = mockCtx();
    SCREEN_RENDERERS.sysdash(c, 128, 76, 0, '#60A5FA');
    const labels = texts(c).map(o => o.t).filter(t => ['CPU', 'MEM', 'DISK', 'NET'].includes(t));
    expect(labels).toEqual(['CPU', 'MEM', 'DISK', 'NET']);
  });
  it('baris footer berisi FPS & UPTIME (deterministik utk t tetap)', () => {
    const c = mockCtx();
    SCREEN_RENDERERS.sysdash(c, 128, 76, 120, '#60A5FA');
    const foot = texts(c).find(o => o.t.startsWith('FPS '));
    expect(foot.t).toBe('FPS 64 · UPTIME 2m'); // 45+floor(|sin(360 rad)|*20)
  });
  it('host live: bar CPU/MEM/NET + angka % di ujung bar dari window.__hostRes', () => {
    const c = mockCtx();
    global.window = { __hostRes: { ok: true, load: 1.2, mem_available_mb: 2000, mem_total_mb: 4000, disk_used_gb: 10, disk_total_gb: 50, agents: 3, uptime_s: 3600, net_rx_mb_s: 1.0, net_tx_mb_s: 0.5 } };
    try {
      SCREEN_RENDERERS.sysdash(c, 128, 76, 7, '#60A5FA');
      const pctTexts = texts(c).map(o => o.t).filter(t => t.endsWith('%'));
      expect(pctTexts).toHaveLength(4);
      pctTexts.forEach(t => { const n = parseFloat(t); expect(n).toBeGreaterThanOrEqual(5); expect(n).toBeLessThanOrEqual(95); });
      // CPU = load*10 = 12%; MEM = 2000/4000 = 50%; DISK = 10/50 GB = 20%
      expect(pctTexts).toContain('12%');
      expect(pctTexts).toContain('50%');
      expect(pctTexts).toContain('20%');
      // NET nyata (siklus 543): rx+tx = 1.5 MB/s → 20+24*log2(2.5) ≈ 52%
      const net = pctTexts.find(t => !['12%','50%','20%'].includes(t));
      expect(parseFloat(net)).toBeCloseTo(20 + 24 * Math.log2(2.5), 0);
      // UPTIME dari host nyata: 3600s = 1j (format j/m siklus 538)
      expect(texts(c).some(o => o.t.includes('UPTIME 1j'))).toBe(true);
    } finally { delete global.window; }
  });
  it('NET live dari throughput nyata net_rx_mb_s/net_tx_mb_s (siklus 543)', () => {
    // trafik 0 MB/s → bar minimum 20% (bukan 5%)
    const c0 = mockCtx();
    global.window = { __hostRes: { ok: true, net_rx_mb_s: 0, net_tx_mb_s: 0 } };
    try {
      SCREEN_RENDERERS.sysdash(c0, 128, 76, 2, '#60a5fa');
      const pct = texts(c0).map(o => o.t).filter(t => t.endsWith('%'));
      expect(pct[3]).toBe('20%');
    } finally { delete global.window; }
    // korup → fallback sin lama (deterministik utk t=2), tanpa NaN
    for (const H of [{ ok: true, net_rx_mb_s: NaN }, { ok: true, net_rx_mb_s: 'banyak' }, { ok: true }]) {
      const c2 = mockCtx();
      global.window = { __hostRes: H };
      try {
        SCREEN_RENDERERS.sysdash(c2, 128, 76, 2, '#60a5fa');
        const pct = texts(c2).map(o => o.t).filter(t => t.endsWith('%'));
        expect(pct[3]).toBe(String(Math.round(30 + Math.sin(2 * 2.2) * 25)) + '%');
      } finally { delete global.window; }
    }
  });
  it('DISK live dari disk_used_gb/disk_total_gb; korup → fallback tanpa NaN', () => {
    const c = mockCtx();
    global.window = { __hostRes: { ok: true, disk_used_gb: 25, disk_total_gb: 50 } };
    try {
      SCREEN_RENDERERS.sysdash(c, 128, 76, 4, '#fbbf24');
      expect(texts(c).some(o => o.t === '50%')).toBe(true); // 25/50 GB
    } finally { delete global.window; }
    for (const H of [null, { ok: true, disk_used_gb: NaN }, { ok: true, disk_used_gb: 'banyak' }]) {
      const c2 = mockCtx();
      global.window = { __hostRes: H };
      try {
        SCREEN_RENDERERS.sysdash(c2, 128, 76, 2, '#fbbf24');
        expect(texts(c2).every(o => !String(o.t).includes('NaN'))).toBe(true);
      } finally { delete global.window; }
    }
  });
  it('tanpa __hostRes / nilai korup → fallback pola lama, tanpa NaN (anti-poisoning)', () => {
    for (const H of [null, undefined, { ok: true, load: 'x', ram_mb: NaN, agents: 'banyak' }, { ok: true }]) {
      const c = mockCtx();
      global.window = { __hostRes: H };
      try {
        SCREEN_RENDERERS.sysdash(c, 128, 76, 2, '#60A5FA');
        expect(texts(c).every(o => !String(o.t).includes('NaN'))).toBe(true);
        expect(texts(c).filter(t => String(t.t).endsWith('%')).length).toBe(4);
      } finally { delete global.window; }
    }
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
  // Siklus 539 (bugfix 538): FPS live dari window.__fps (bukan __hostRes.fps —
  // gateway tak kirim fps); tanpa __fps → fallback; UPTIME format j/m.
  it('FPS live dari window.__fps; tanpa __fps → fallback; UPTIME format j/m', () => {
    global.window = { __hostRes: { ok: true, uptime_s: 3600 * 5 + 120 }, __fps: 57.4 };
    try {
      const c = mockCtx();
      SCREEN_RENDERERS.sysdash(c, 128, 76, 7, '#60A5FA');
      const foot = texts(c).find(o => o.t.startsWith('FPS ')).t;
      expect(foot).toBe('FPS 57 · UPTIME 5j2m');
    } finally { delete global.window; }
    global.window = { __hostRes: { ok: true, fps: 57.4, uptime_s: 7200 }, __fps: NaN };
    try {
      const c = mockCtx();
      SCREEN_RENDERERS.sysdash(c, 128, 76, 7, '#60A5FA');
      const foot = texts(c).find(o => o.t.startsWith('FPS ')).t;
      expect(foot).toBe('FPS 61 · UPTIME 2j'); // fallback 45+floor(|sin(21 rad)|*20)
      expect(foot).not.toContain('NaN');
    } finally { delete global.window; }
    global.window = { __hostRes: { ok: true, uptime_s: 3540 }, __fps: 45 };
    try {
      const c = mockCtx();
      SCREEN_RENDERERS.sysdash(c, 128, 76, 7, '#60A5FA');
      expect(texts(c).find(o => o.t.startsWith('FPS ')).t).toBe('FPS 45 · UPTIME 59m');
    } finally { delete global.window; }
  });
