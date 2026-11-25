import { describe, it, expect } from 'vitest';
import * as pal from '../lib/ui_palette.js';
import * as wc from '../scene/parts/wall_canvas.js';

// Siklus 453 — guard palet kanvas dinding satu sumber (nilai historis terkunci).
describe('wall_canvas palet satu sumber (WC_*)', () => {
  it('nilai WC_* terkunci identik historis', () => {
    expect(pal.WC_TEX_TOP).toBe('rgba(255,255,255,.12)');
    expect(pal.WC_TEX_BOTTOM).toBe('rgba(0,0,0,.08)');
    expect(pal.WC_UPPER_DAY).toEqual({ base: '#E6EAF1', line: 'rgba(120,138,165,.48)' });
    expect(pal.WC_WOOD_DAY).toEqual({ base: '#8A6244', line: 'rgba(40,25,10,.40)' });
    expect(pal.WC_NIGHT_UPPER).toEqual({ base: '#1B2436', line: 'rgba(96,116,150,0.32)' });
    expect(pal.WC_NIGHT_WOOD).toEqual({ base: '#3B2B1D', line: 'rgba(20,12,6,0.45)' });
    expect(pal.WC_TRIM_DAY).toBe(0xF4F6FA);
    expect(pal.WC_TRIM_NIGHT).toBe(0x8FA0BC);
    expect(pal.WC_PIER_DAY).toBe(0x8E9BB0);
    expect(pal.WC_PIER_NIGHT).toBe(0x3E4A61);
  });

  it('anti-poisoning: re-ekspor wall_canvas identik konstanta sumber', () => {
    expect(wc.WALL_TEX_TOP).toBe(pal.WC_TEX_TOP);
    expect(wc.WALL_TEX_BOTTOM).toBe(pal.WC_TEX_BOTTOM);
    expect(wc.WALL_UPPER_DAY).toBe(pal.WC_UPPER_DAY);
    expect(wc.WALL_WOOD_DAY).toBe(pal.WC_WOOD_DAY);
    expect(wc.TRIM_DAY).toBe(pal.WC_TRIM_DAY);
    expect(wc.TRIM_NIGHT).toBe(pal.WC_TRIM_NIGHT);
    expect(wc.PIER_DAY).toBe(pal.WC_PIER_DAY);
    expect(wc.PIER_NIGHT).toBe(pal.WC_PIER_NIGHT);
    expect(wc.WALL_NIGHT.upper).toBe(pal.WC_NIGHT_UPPER);
    expect(wc.WALL_NIGHT.wood).toBe(pal.WC_NIGHT_WOOD);
  });

  it('pemakaian di titik asal: drawWallTex memakai gradien WC_TEX_*', () => {
    const calls = [];
    const stop = (p, c) => calls.push([p, c]);
    const mkGrad = () => ({ addColorStop: stop });
    const rects = [];
    const ctx = {
      fillRect: (...a) => rects.push(a),
      beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {},
      createLinearGradient: (...a) => { calls.push(['grad', a]); return mkGrad(); },
      set fillStyle(v) { this._f = v; }, get fillStyle() { return this._f; },
      set strokeStyle(v) {}, get strokeStyle() { return ''; },
      set lineWidth(v) {},
    };
    wc.drawWallTex(ctx, '#E6EAF1', 'rgba(120,138,165,.48)', 512, 256, 64);
    const gradColors = calls.filter(c => c[0] !== 'grad' && c.length === 2).map(c => c[1]);
    expect(gradColors).toContain(pal.WC_TEX_TOP);
    expect(gradColors).toContain(pal.WC_TEX_BOTTOM);
    expect(rects.length).toBeGreaterThan(0);
  });

  it('0 literal warna di wall_canvas.js (delegasi penuh)', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../scene/parts/wall_canvas.js', import.meta.url), 'utf8');
    const stripped = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(stripped).not.toMatch(/0x[0-9a-fA-F]{6}/);
    expect(stripped).not.toMatch(/['"]#[0-9a-fA-F]{3,6}['"]/);
    expect(stripped).not.toMatch(/['"]rgba?\([^)]+\)['"]/);
  });
});
