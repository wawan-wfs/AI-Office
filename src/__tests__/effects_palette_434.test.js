import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const effects = readFileSync(fileURLToPath(new URL('../scene/parts/effects.js', import.meta.url)), 'utf8');

it('FX_* terkunci nilai historis', () => {
  expect(palette.FX_PAGE_TINTS).toEqual([0x22d3ee, 0xfbbf24, 0x4ade80, 0xe879f9, 0x60a5fa, 0xfb923c, 0x8b5cf6, 0xf87171, 0xfff3d6]);
  expect(palette.FX_POT_CLAY).toBe(0xc4b5ae);
  expect(palette.FX_LEAF).toBe(0x57a85b);
  expect(palette.FX_HP_BAND).toBe(0x2f3236);
  expect(palette.FX_HP_CUP).toBe(0x1d1f22);
});

it('FX_PAGE_TINTS terpisah dari konstanta aksen nilai-sama', () => {
  // anti-poisoning: array dokumen dideklarasikan mandiri, bukan gabungan aksen lain
  expect(palette.FX_PAGE_TINTS).toHaveLength(9);
  expect(palette.FX_PAGE_TINTS[0]).not.toBe(palette.AMBER_ACCENT);
});

it('effects.js memakai FX_* di titik asal', () => {
  expect(effects).toContain('const tints = FX_PAGE_TINTS;');
  expect(effects).toContain('FX_POT_CLAY,');
  expect(effects).toContain('FX_HP_BAND,');
});

it('effects.js 0 literal hex blok FX tersisa', () => {
  const code = effects.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  expect(code.match(/0x[0-9A-Fa-f]{6}/g) ?? []).toEqual([]);
});
