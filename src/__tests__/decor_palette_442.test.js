import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const src = readFileSync(fileURLToPath(new URL('../scene/parts/decor.js', import.meta.url)), 'utf8');

it('DC_* terkunci nilai historis', () => {
  expect(palette.DC_POT_CLAY).toBe(0x8B5E3C);
  expect(palette.DC_LEAF_A).toBe(0x2E7D32);
  expect(palette.DC_LEAF_B).toBe(0x43A047);
  expect(palette.DC_GLASS).toBe(0x9ad8ff);
  expect(palette.DC_RUG_OUTER).toBe(0x1565C0);
  expect(palette.DC_RUG_INNER).toBe(0xEF6C00);
  expect(palette.DC_LOUNGE_LIGHT).toBe(0xFFC97A);
});

it('DC_* konstanta terpisah dgn nilai mirip', () => {
  expect(palette.DC_LEAF_A).not.toBe(palette.DC_LEAF_B);
  expect(palette.DC_RUG_OUTER).not.toBe(palette.DC_RUG_INNER);
  expect(palette.DC_LOUNGE_LIGHT).not.toBe(palette.SR_LIGHT_CYAN);
});

it('decor.js memakai DC_* di titik asalnya', () => {
  expect(src).toContain('M(DC_POT_CLAY)');
  expect(src).toContain('DC_LEAF_A : DC_LEAF_B');
  expect(src).toContain('color: DC_GLASS');
  expect(src).toContain('color: DC_RUG_OUTER');
  expect(src).toContain('color: DC_RUG_INNER');
  expect(src).toContain('PointLight(DC_LOUNGE_LIGHT');
});

it('decor.js 0 literal hex tersisa', () => {
  expect(src.match(/0x[0-9A-Fa-f]{6}/g)).toBeNull();
});
