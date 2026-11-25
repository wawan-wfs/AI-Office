import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { POSTER_BG, drawPoster } from '../scene/parts/poster_canvas.js';
import * as pal from '../lib/ui_palette.js';

const palSrc = readFileSync(new URL('../lib/ui_palette.js', import.meta.url), 'utf8');
const pcSrc = readFileSync(new URL('../scene/parts/poster_canvas.js', import.meta.url), 'utf8');

describe('Siklus 462: palet poster satu sumber', () => {
it('PC_BG terkunci nilai historis', () => {
  expect(pal.PC_BG).toBe('#14172b');
  expect(POSTER_BG).toBe(pal.PC_BG);
});

it('anti-poisoning: delegasi POSTER_BG ke PC_BG', () => {
  expect(pcSrc).toMatch(/export const POSTER_BG = PC_BG;/);
  expect(palSrc).toMatch(/export const PC_BG = '#14172b';/);
});

it('pemakaian painter di titik asal', () => {
  const c = { _ops: [] };
  const ctx = new Proxy({}, { set: (t, k, v) => { c._ops.push([k, v]); return true; }, get: () => () => {} });
  drawPoster(ctx, '#ffffff', 'HI');
  expect(c._ops[0]).toEqual(['fillStyle', POSTER_BG]);
});

it('0 literal warna di poster_canvas.js', () => {
  const code = pcSrc.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  expect(code).not.toMatch(/#[0-9A-Fa-f]{3,8}|rgba?\(/);
});
});

