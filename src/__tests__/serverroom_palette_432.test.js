import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const src = readFileSync(fileURLToPath(new URL('../scene/parts/serverroom.js', import.meta.url)), 'utf8');

it('SR_* terkunci nilai historis', () => {
  expect(palette.SR_RACK_BODY).toBe(0x2E3244);
  expect(palette.SR_RACK_EDGE).toBe(0x00E5FF);
  expect(palette.SR_RACK_UNIT).toBe(0x3A3F55);
  expect(palette.SR_LED_COLORS).toEqual([0x00E676, 0xFFC107, 0x2979FF]);
  expect(palette.SR_PLINTH).toBe(0x1A1D28);
  expect(palette.SR_LIGHT_CYAN).toBe(0x00BCD4);
  expect(palette.SR_BULB).toBe(0xB2EBF2);
  expect(palette.SR_CABLE).toBe(0x333344);
  expect(palette.SR_COOLER_BODY).toBe(0xE0E0E0);
  expect(palette.SR_COOLER_JUG).toBe(0x4FC3F7);
  expect(palette.SR_COOLER_TAP).toBe(0x607D8B);
  expect(palette.SR_BUBBLE).toBe(0x81D4FA);
});

it('SR_* konstanta terpisah dari konstanta lain dgn nilai mirip', () => {
  // SR_RACK_EDGE (0x00E5FF) tak boleh alias TUBE_NEON/CYAN lain
  expect(palette.SR_RACK_EDGE).not.toBe(palette.TUBE_NEON);
  // SR_LED_COLORS[0] ≠ AMEN_PRINT_LED (hijau berbeda nuansa) — cek RACK_UNIT
  expect(palette.SR_RACK_UNIT).not.toBe(palette.SR_RACK_BODY);
});

it('serverroom.js memakai SR_* di titik asalnya', () => {
  expect(src).toContain('M(SR_RACK_BODY)');
  expect(src).toContain('MB(SR_RACK_EDGE)');
  expect(src).toContain('M(SR_RACK_UNIT)');
  expect(src).toContain('SR_LED_COLORS.forEach');
  expect(src).toContain('M(SR_PLINTH)');
  expect(src).toContain('PointLight(SR_LIGHT_CYAN');
  expect(src).toContain('MB(SR_BULB)');
  expect(src).toContain('M(SR_CABLE)');
  expect(src).toContain('M(SR_COOLER_BODY)');
  expect(src).toContain('SR_COOLER_JUG');
  expect(src).toContain('M(SR_COOLER_TAP)');
  expect(src).toContain('SR_BUBBLE');
});

it('serverroom.js 0 literal hex tersisa', () => {
  expect(src.match(/0x[0-9A-Fa-f]{6}/g)).toBeNull();
});
