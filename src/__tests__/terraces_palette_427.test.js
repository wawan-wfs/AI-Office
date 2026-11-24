import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as P from '../lib/ui_palette.js';

const src = readFileSync(resolve(__dirname, '../scene/parts/terraces.js'), 'utf8');

describe('terraces palette single-source (siklus 427)', () => {
  it('nilai historis terkunci di ui_palette', () => {
    expect(P.TERR_GLASS_RAIL).toBe(0xCCE8FF);
    expect(P.TERR_WHITE).toBe(0xFFFFFF);
    expect(P.TERR_GOLD).toBe(0xD4AF37);
    expect(P.TERR_DL1_WARM).toBe(0xFFE8CC);
    expect(P.TERR_SAND).toBe(0xFAF8F5);
    expect(P.TERR_PEBBLE).toBe(0x334155);
    expect(P.TERR_TRUNK).toBe(0x4A2E18);
    expect(P.TERR_FOLIAGE).toBe(0x10B981);
    expect(P.TERR_STEP_TREAD).toBe(0x1F2C42);
    expect(P.TERR_STEP_RISER).toBe(0x162236);
    expect(P.TERR_STRINGER).toBe(0x0F172A);
    expect(P.TERR_STAIR_LED).toBe(0x00E5FF);
    expect(P.TERR_LED_L2).toBe(0x00F0FF);
    expect(P.TERR_LED_L3).toBe(0x10E5A0);
    expect(P.TERR_PYLON).toBe(0x182438);
    expect(P.TERR_DARK_L1).toBe(0x162236);
    expect(P.TERR_DARK_L2).toBe(0x182842);
    expect(P.TERR_DARK_L3).toBe(0x121E30);
    expect(P.TERR_DAY_L1).toBe(0xF1F5F9);
    expect(P.TERR_DAY_L2).toBe(0xE2E8F0);
    expect(P.TERR_DAY_L3).toBe(0xCBD5E1);
  });
  it('terraces.js delegasi penuh ke konstanta palet', () => {
    for (const c of ['TERR_GLASS_RAIL','TERR_WHITE','TERR_GOLD','TERR_DL1_WARM','TERR_SAND','TERR_PEBBLE','TERR_TRUNK','TERR_FOLIAGE','TERR_STEP_TREAD','TERR_STEP_RISER','TERR_STRINGER','TERR_STAIR_LED','TERR_LED_L2','TERR_LED_L3','TERR_PYLON','TERR_DARK_L1','TERR_DARK_L2','TERR_DARK_L3','TERR_DAY_L1','TERR_DAY_L2','TERR_DAY_L3'])
      expect(src).toContain(c);
  });
  it('0 literal warna hex tersisa di terraces.js', () => {
    expect(src.match(/0x[0-9A-Fa-f]{6}/g)).toBeNull();
  });
  it('anti-poisoning: konstanta mirip tetap terpisah', () => {
    expect(P.TERR_STEP_TREAD).not.toBe(P.TERR_DARK_L1); // 0x1F2C42 vs 0x162236
    expect(P.TERR_LED_L2).not.toBe(P.TERR_STAIR_LED);   // 0x00F0FF vs 0x00E5FF
    expect(P.TERR_GOLD).not.toBe(P.GOLD_ACCENT);        // scene numeric vs CSS hex
  });
});
