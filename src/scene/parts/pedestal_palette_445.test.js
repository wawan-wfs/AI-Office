// Guard siklus 445: palet pedestal & floor_zones satu sumber via ui_palette (PD_*/FZ_*).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as pal from '../../lib/ui_palette.js';
import { LIP, GLOW, PLINTH } from './pedestal.js';
import { ZONES } from './floor_zones.js';

const root = resolve(import.meta.dirname, '../..');
const palSrc = readFileSync(resolve(root, 'lib/ui_palette.js'), 'utf8');
const pedSrc = readFileSync(resolve(root, 'scene/parts/pedestal.js'), 'utf8');
const fzSrc = readFileSync(resolve(root, 'scene/parts/floor_zones.js'), 'utf8');

describe('pedestal & floor_zones palette (siklus 445)', () => {
  it('PD_*/FZ_* terkunci nilai historis', () => {
    expect(pal.PD_PLINTH).toBe(0x0D1B2E);
    expect(pal.PD_LIP).toBe(0xD4AF37);
    expect(pal.PD_GLOW).toBe(0x00E5FF);
    expect(pal.FZ_DEV_DESK).toBe(0x1E3A5F);
    expect(pal.FZ_MEETING).toBe(0x4A3A1A);
    expect(pal.FZ_LOUNGE).toBe(0x143326);
    expect(pal.FZ_CAFE).toBe(0x2E1533);
    expect(pal.FZ_SERVER).toBe(0x1F1F2E);
  });

  it('anti-poisoning: konstanta primitif, bukan hasil ekspresi', () => {
    expect(typeof pal.PD_PLINTH).toBe('number');
    expect(typeof pal.FZ_CAFE).toBe('number');
    expect(palSrc).toMatch(/export const PD_PLINTH = 0x0D1B2E;/);
    expect(palSrc).toMatch(/export const FZ_SERVER = 0x1F1F2E;/);
  });

  it('pemakaian di titik asal', () => {
    expect(LIP.COLOR).toBe(pal.PD_LIP);
    expect(GLOW.COLOR).toBe(pal.PD_GLOW);
    expect(ZONES.map((z) => z.color)).toEqual([
      pal.FZ_DEV_DESK, pal.FZ_MEETING, pal.FZ_LOUNGE, pal.FZ_CAFE, pal.FZ_SERVER,
    ]);
  });

  it('0 literal warna tersisa di pedestal.js & floor_zones.js (komentar dikecualikan)', () => {
    const code = (s) => s.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    expect(code(pedSrc)).not.toMatch(/0x[0-9a-fA-F]{6}/);
    expect(code(fzSrc)).not.toMatch(/0x[0-9a-fA-F]{6}/);
  });
});
