// Guard siklus 446: palet aksesori & wajah karakter satu sumber via ui_palette (AG_*).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as pal from '../../lib/ui_palette.js';

const root = resolve(import.meta.dirname, '../..');
const palSrc = readFileSync(resolve(root, 'lib/ui_palette.js'), 'utf8');
const osSrc = readFileSync(resolve(root, 'scene/OfficeScene.js'), 'utf8');

describe('aksesori & wajah karakter palette (siklus 446)', () => {
  it('AG_* terkunci nilai historis', () => {
    expect(pal.AG_GLASSES_DARK).toBe(0x111111);
    expect(pal.AG_SKIN_CREAM).toBe(0xF5F0E6);
    expect(pal.AG_HAT_BRIM).toBe(0x27303F);
    expect(pal.AG_BEANIE).toBe(0x37474F);
    expect(pal.AG_CAP_TOP).toBe(0x212121);
    expect(pal.AG_BEARD).toBe(0x222222);
    expect(pal.AG_ANTENNA_ROD).toBe(0x90A4AE);
    expect(pal.AG_BLAZER).toBe(0x263238);
    expect(pal.AG_SHIRT_WHITE).toBe(0xFFFFFF);
    expect(pal.AG_TIE).toBe(0x7F1D1D);
    expect(pal.AG_PANTS_MATCH_A).toBe(0x08281F);
    expect(pal.AG_PANTS_MATCH_B).toBe(0x111827);
    expect(pal.AG_PANTS_MATCH_C).toBe(0x212121);
    expect(pal.AG_PANTS_DEFAULT).toBe(0x1E293B);
    expect(pal.AG_PANTS_FALLBACK).toBe(0x334155);
    expect(pal.AG_BLUSH).toBe(0xFCA5A5);
    expect(pal.AG_PUPIL).toBe(0x1E293B);
    expect(pal.AG_MOUTH).toBe(0xB45309);
    expect(pal.AG_LANYARD).toBe(0x35507A);
  });

  it('anti-poisoning: konstanta primitif, bukan hasil ekspresi', () => {
    for (const k of ['AG_GLASSES_DARK','AG_SKIN_CREAM','AG_HAT_BRIM','AG_BEANIE','AG_CAP_TOP','AG_BEARD','AG_ANTENNA_ROD','AG_BLAZER','AG_SHIRT_WHITE','AG_TIE','AG_PANTS_MATCH_A','AG_PANTS_MATCH_B','AG_PANTS_MATCH_C','AG_PANTS_DEFAULT','AG_PANTS_FALLBACK','AG_BLUSH','AG_PUPIL','AG_MOUTH','AG_LANYARD']) {
      expect(typeof pal[k], k).toBe('number');
    }
    expect(palSrc).toMatch(/export const AG_SKIN_CREAM = 0xF5F0E6;/);
    expect(palSrc).toMatch(/export const AG_LANYARD = 0x35507A;/);
  });

  it('pemakaian di titik asal: OfficeScene.js delegasi AG_*', () => {
    expect(osSrc).toMatch(/AG_GLASSES_DARK/);
    expect(osSrc).toMatch(/AG_PANTS_MATCH_C\) \? AG_PANTS_DEFAULT : \(agent\.pants \|\| AG_PANTS_FALLBACK\)/);
    expect(osSrc).toMatch(/MB\(AG_PUPIL\)/);
  });

  it('0 literal warna tersisa di OfficeScene.js (komentar dikecualikan)', () => {
    const code = osSrc.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    expect(code).not.toMatch(/0x[0-9a-fA-F]{6}/);
  });
});
