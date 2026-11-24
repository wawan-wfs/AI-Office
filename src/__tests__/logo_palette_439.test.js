import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const logo = readFileSync(fileURLToPath(new URL('../scene/parts/logo_canvas.js', import.meta.url)), 'utf8');

it('LC_* kanvas logo terkunci nilai historis', () => {
  expect(palette.LC_BG).toBe('#0F1B2E');
  expect(palette.LC_FRAME).toBe('#D4AF37');
  expect(palette.LC_GRAD_A).toBe('#FBBF24');
  expect(palette.LC_GRAD_B).toBe('#F97316');
  expect(palette.LC_TEXT).toBe('#FFFFFF');
  expect(palette.LC_TAGLINE).toBe('rgba(255,255,255,.75)');
  expect(palette.LC_TITLE_NIGHT_W).toBe('#7E90B4');
  expect(palette.LC_TITLE_NIGHT_P).toBe('#8A5E1A');
  expect(palette.TITLE_DAY).toEqual({ w: '#FFFFFF', p: '#F59E0B' });
  expect(palette.TITLE_DAY).not.toBe(palette.LC_TEXT); // objek terpisah dari string
});

it('TITLE_NIGHT delegasi LC_TITLE_NIGHT_* (anti-poisoning)', () => {
  // nilai TITLE_NIGHT di logo_canvas diambil dari konstanta LC_*, bukan literal baru
  const src = readFileSync(fileURLToPath(new URL('../scene/parts/logo_canvas.js', import.meta.url)), 'utf8');
  expect(src).toContain('w: LC_TITLE_NIGHT_W');
  expect(src).toContain('p: LC_TITLE_NIGHT_P');
});

it('logo_canvas.js memakai LC_* di titik asal', () => {
  expect(logo).toContain("ctx.fillStyle=LC_BG;ctx.fillRect");
  expect(logo).toContain('ctx.strokeStyle=LC_FRAME;');
  expect(logo).toContain('ctx.fillStyle=LC_TAGLINE;');
});

it('logo_canvas.js 0 literal warna tersisa', () => {
  const code = logo.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  expect(code.match(/'#[0-9A-Fa-f]{3,8}'|'rgba\([^)]*\)'/g) ?? []).toEqual([]);
});
