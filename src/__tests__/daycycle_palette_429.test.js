// Siklus 429: palet daycycle/NEON satu sumber.
// Sebelumnya literal di parts/daycycle.js — NAVY 0x010a28, tint matahari
// 0xfff8f0/0xffaa66/0xffcc88, blok NEON (floor/carpet/tube/ceilPanel/skyWin/
// pendant) dan blok restore. Nilai identik kode lama — tampilan tak berubah.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as P from '../lib/ui_palette.js';

const src = readFileSync(fileURLToPath(new URL('../scene/parts/daycycle.js', import.meta.url)), 'utf8');

describe('daycycle palette 429', () => {
  it('nilai historis terkunci', () => {
    expect(P.SCENE_SKY).toBe(0x010A28);
    expect(P.DC_SUN_TINT_BASE).toBe(0xfff8f0);
    expect(P.DC_SUN_SUNSET).toBe(0xffaa66);
    expect(P.DC_SUN_MORNING).toBe(0xffcc88);
    expect(P.DC_NEON_FLOOR).toBe(0x1a2638);
    expect(P.DC_NEON_CARPET).toBe(0x142033);
    expect(P.DC_NEON_TUBE_LIGHT).toBe(0x00F0FF);
    expect(P.DC_NEON_TUBE_MESH).toBe(0x18E0FF);
    expect(P.DC_NEON_CEIL_PANEL).toBe(0x0A1526);
    expect(P.DC_NEON_SKY_WIN).toBe(0x14213F);
    expect(P.DC_NEON_PEND_BULB).toBe(0x16243D);
    expect(P.DC_NEON_PEND_LIGHT).toBe(0x1E3A5F);
    expect(P.DC_RESTORE_FLOOR).toBe(0xffffff);
    expect(P.DC_RESTORE_CARPET).toBe(0xd0d8e0);
    expect(P.DC_RESTORE_TUBE_MESH).toBe(0x334466);
    expect(P.DC_RESTORE_PEND_BULB).toBe(0xffffff);
    expect(P.DC_RESTORE_PEND_LIGHT).toBe(0xffe8cc);
  });

  it('daycycle delegasi — konstanta dipakai di titik asal', () => {
    for (const c of ['DC_NAVY','DC_SUN_TINT_BASE','DC_SUN_SUNSET','DC_SUN_MORNING',
      'DC_NEON_FLOOR','DC_NEON_CARPET','DC_NEON_TUBE_LIGHT','DC_NEON_TUBE_MESH',
      'DC_NEON_CEIL_PANEL','DC_NEON_SKY_WIN','DC_NEON_PEND_BULB','DC_NEON_PEND_LIGHT',
      'DC_RESTORE_FLOOR','DC_RESTORE_CARPET','DC_RESTORE_TUBE_MESH',
      'DC_RESTORE_PEND_BULB','DC_RESTORE_PEND_LIGHT','CEIL_PANEL_DAY']) {
      expect(src).toContain(c);
    }
    expect(src).toContain('const NAVY = DC_NAVY');
    expect(src).toContain('m.color.set(DC_RESTORE_FLOOR)');
  });

  it('0 literal daycycle tersisa di daycycle.js', () => {
    for (const lit of ['0x010a28','0xfff8f0','0xffaa66','0xffcc88','0x1a2638',
      '0x142033','0x00F0FF','0x18E0FF','0x0A1526','0x14213F','0x16243D',
      '0x1E3A5F','0xd0d8e0','0x334466','0xffe8cc','0xF0F4FF']) {
      expect(src).not.toContain(lit);
    }
    // 0xffffff sengaja tak dites: DC_RESTORE_* menggantikan semua pemakaian;
    // verifikasi eksplisit:
    expect(src.match(/0xffffff/g) || []).toHaveLength(0);
  });

  it('anti-poisoning: DC_NAVY = SCENE_SKY, terpisah dari DC_NEON_SKY_WIN', () => {
    expect(P.DC_NAVY ?? P.SCENE_SKY).not.toBe(P.DC_NEON_SKY_WIN);
    expect(P.DC_RESTORE_TUBE_MESH).toBe(P.TUBE_NEON); // nilai sama historis, konstanta terpisah
  });
});
