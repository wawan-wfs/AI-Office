// Siklus 430: palet dinding kampus satu sumber.
// Sebelumnya literal di parts/walls.js — NAVY 0x24304A, GOLD 0xD4AF37, TRIM
// 0xF4F6FA, frame jendela 0x2B3446, kotak bunga 0x3A4A5E, bunga day/night,
// backdrop logo 0x14243D, sorot logo 0x222222/0xFFE9A8/0xFFE2A0.
// Nilai identik kode lama — tampilan tak berubah.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as P from '../lib/ui_palette.js';

const src = readFileSync(fileURLToPath(new URL('../scene/parts/walls.js', import.meta.url)), 'utf8');

describe('walls palette 430', () => {
  it('nilai historis terkunci', () => {
    expect(P.WALL_NAVY).toBe(0x24304A);
    expect(P.WALL_TRIM).toBe(0xF4F6FA);
    expect(P.TERR_GOLD).toBe(0xD4AF37);
    expect(P.WALL_WIN_FRAME).toBe(0x2B3446);
    expect(P.WALL_PLANTER_BOX).toBe(0x3A4A5E);
    expect(P.WALL_FLOWER_DAY).toEqual([0xE86A92, 0xF2C14E, 0x7FC8A9, 0xF6F2EA]);
    expect(P.WALL_FLOWER_NIGHT).toEqual([0x5A2740, 0x6B4E1E, 0x1F4F3E, 0x3A4256]);
    expect(P.WALL_LOGO_BACKDROP).toBe(0x14243D);
    expect(P.WALL_SPOT_BODY).toBe(0x222222);
    expect(P.WALL_BULB_WARM).toBe(0xFFE9A8);
    expect(P.WALL_SPOT_WARM).toBe(0xFFE2A0);
  });

  it('walls delegasi — konstanta dipakai di titik asal', () => {
    for (const c of ['WALL_NAVY','TERR_GOLD','WALL_TRIM','WALL_WIN_FRAME',
      'WALL_PLANTER_BOX','WALL_FLOWER_DAY','WALL_FLOWER_NIGHT',
      'WALL_LOGO_BACKDROP','WALL_SPOT_BODY','WALL_BULB_WARM','WALL_SPOT_WARM']) {
      expect(src).toContain(c);
    }
    expect(src).toContain('const NAVY=WALL_NAVY');
    expect(src).not.toContain('const FR=0x');
  });

  it('0 literal walls tersisa di walls.js', () => {
    for (const lit of ['0x24304A','0xD4AF37','0xF4F6FA','0x2B3446','0x3A4A5E',
      '0xE86A92','0xF2C14E','0x7FC8A9','0xF6F2EA','0x5A2740','0x6B4E1E',
      '0x1F4F3E','0x3A4256','0x14243D','0x222222','0xFFE9A8','0xFFE2A0']) {
      expect(src).not.toContain(lit);
    }
  });

  it('anti-poisoning: WALL_LOGO_BACKDROP = SCENE_WALL_DEEP nilai sama, konstanta terpisah', () => {
    expect(P.WALL_LOGO_BACKDROP).toBe(P.SCENE_WALL_DEEP); // 0x14243D historis sama
    expect(P.WALL_TRIM).not.toBe(P.WALL_NAVY);
  });
});
