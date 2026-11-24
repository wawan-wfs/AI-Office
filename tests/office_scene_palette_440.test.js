import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { RC_FOUNDER_ACCENT, RC_FOUNDER_HEX, RC_FOUNDER_FALLBACK_HEX, RC_FOUNDER_HAIR, RC_FOUNDER_SHIRT, RC_FOUNDER_PANTS } from '../src/lib/ui_palette.js';

const src = readFileSync(new URL('../src/scene/OfficeScene.js', import.meta.url), 'utf8');
const pal = readFileSync(new URL('../src/lib/ui_palette.js', import.meta.url), 'utf8');

describe('siklus 440 — founder palette satu sumber', () => {
  it('nilai terkunci di palet', () => {
    expect(RC_FOUNDER_ACCENT).toBe(0xF59E0B);
    expect(RC_FOUNDER_HEX).toBe('#F59E0B');
    expect(RC_FOUNDER_FALLBACK_HEX).toBe('#38BDF8');
    expect(RC_FOUNDER_HAIR).toBe(0x1a1a1a);
    expect(RC_FOUNDER_SHIRT).toBe(0xB45309);
    expect(RC_FOUNDER_PANTS).toBe(0x292524);
  });
  it('anti-poisoning: konstanta primitif terpisah', () => {
    expect(RC_FOUNDER_HEX).not.toBe(RC_FOUNDER_ACCENT);
    expect(RC_FOUNDER_FALLBACK_HEX).not.toBe(RC_FOUNDER_HEX);
  });
  it('pemakaian di titik asal', () => {
    expect(src).toContain('color:RC_FOUNDER_ACCENT,hex:RC_FOUNDER_HEX');
    expect(src).toContain('agent.hex || RC_FOUNDER_FALLBACK_HEX');
    expect(pal).toMatch(/export const RC_FOUNDER_HEX = '#F59E0B'/);
  });
  it('0 literal founder/fallback tersisa di OfficeScene', () => {
    expect(src).not.toMatch(/0xF59E0B|'#F59E0B'|'#38BDF8'/);
  });
});
