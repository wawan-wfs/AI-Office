import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  SR_SEL_COLOR, SR_SEL_RGB, SR_HOVER_COLOR, SR_HOVER_RGB,
} from '../lib/ui_palette.js';

const SR = {
  SR_SEL_COLOR, SR_SEL_RGB, SR_HOVER_COLOR, SR_HOVER_RGB,
};

describe('ring_palette_451 — palet cincin seleksi/hover satu sumber', () => {
  it('nilai terkunci historis (4 konstanta SR_*)', () => {
    expect(SR).toEqual({
      SR_SEL_COLOR: 0xFFD75E,
      SR_SEL_RGB: '255,205,80',
      SR_HOVER_COLOR: 0x9FE8FF,
      SR_HOVER_RGB: '120,220,255',
    });
  });

  it('anti-poisoning: warna hex 24-bit, rgb string valid', () => {
    expect(typeof SR_SEL_COLOR).toBe('number');
    expect(SR_SEL_COLOR).toBeGreaterThanOrEqual(0);
    expect(SR_SEL_COLOR).toBeLessThanOrEqual(0xffffff);
    expect(typeof SR_HOVER_COLOR).toBe('number');
    expect(SR_HOVER_COLOR).toBeGreaterThanOrEqual(0);
    expect(SR_HOVER_COLOR).toBeLessThanOrEqual(0xffffff);
    for (const rgb of [SR_SEL_RGB, SR_HOVER_RGB]) {
      expect(rgb).toMatch(/^\d{1,3},\d{1,3},\d{1,3}$/);
      const parts = rgb.split(',').map(Number);
      expect(parts.length).toBe(3);
      for (const p of parts) expect(p).toBeGreaterThanOrEqual(0), expect(p).toBeLessThanOrEqual(255);
    }
  });

  it('pemakaian di titik asal: ring_spec.js delegasi ke konstanta SR_*', () => {
    const src = readFileSync(new URL('../scene/parts/ring_spec.js', import.meta.url), 'utf8');
    expect(src).toContain('import { SR_SEL_COLOR, SR_SEL_RGB, SR_HOVER_COLOR, SR_HOVER_RGB }');
    expect(src).toContain('COLOR: SR_SEL_COLOR');
    expect(src).toContain('RGB: SR_SEL_RGB');
    expect(src).toContain('COLOR: SR_HOVER_COLOR');
    expect(src).toContain('RGB: SR_HOVER_RGB');
  });

  it('ring_spec.js bebas literal warna', () => {
    const src = readFileSync(new URL('../scene/parts/ring_spec.js', import.meta.url), 'utf8');
    expect(src.match(/0x[0-9a-fA-F]{6}\b/g) ?? []).toHaveLength(0);
    expect(src.match(/'\d{1,3},\d{1,3},\d{1,3}'/g) ?? []).toHaveLength(0);
  });
});
