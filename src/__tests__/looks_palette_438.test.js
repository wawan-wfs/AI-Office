import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const looks = readFileSync(fileURLToPath(new URL('../scene/parts/character_looks.js', import.meta.url)), 'utf8');

it('LK_* skin terkunci nilai historis', () => {
  expect(palette.LK_BANTUIN).toBe(0xCFD8DC);
  expect(palette.LK_BUDI).toBe(0xD9A273);
  expect(palette.LK_RIZKY).toBe(0xE8B88A);
  expect(palette.LK_DEWI).toBe(0xF1C9A0);
  expect(palette.LK_ANDI).toBe(0xC68B5E);
  expect(palette.LK_YOGA).toBe(0xE0AC7E);
  expect(palette.LK_MAYA).toBe(0xF3D2B0);
  expect(palette.LK_TONI).toBe(0xB97F55);
  expect(palette.LK_RINA).toBe(0xEBC39A);
  expect(palette.LK_LINA).toBe(0xF0C8A2);
  expect(palette.LK_SARI).toBe(0xD9A273);
  expect(palette.LK_WAHYU).toBe(0xE8B88A);
  expect(palette.LK_TRAINER).toBe(0xB39DDB);
  expect(palette.LK_INTEGRATOR).toBe(0x90CAF9);
  expect(palette.LK_SUPPORT).toBe(0xCFA27F);
  expect(palette.LK_FALLBACK).toBe(0xE8B88A);
});

it('skin nilai-sama tetap konstanta mandiri (anti-poisoning)', () => {
  // skin adalah primitif number — pemisahan diverifikasi lewat sumber, bukan identitas objek
  const pal = readFileSync(fileURLToPath(new URL('../lib/ui_palette.js', import.meta.url)), 'utf8');
  expect(pal).toContain('export const LK_BUDI = 0xD9A273;');
  expect(pal).toContain('export const LK_SARI = 0xD9A273;');
  expect(pal).toContain('export const LK_FALLBACK = 0xE8B88A;');
});

it('character_looks.js memakai LK_* di titik asal', () => {
  expect(looks).toContain('skin:LK_BANTUIN');
  expect(looks).toContain('skin:LK_FALLBACK');
});

it('character_looks.js 0 literal hex tersisa', () => {
  const code = looks.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  expect(code.match(/0x[0-9A-Fa-f]{6}/g) ?? []).toEqual([]);
});
