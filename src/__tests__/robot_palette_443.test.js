import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const src = readFileSync(fileURLToPath(new URL('../scene/parts/robot.js', import.meta.url)), 'utf8');

it('RB_* terkunci nilai historis', () => {
  expect(palette.RB_TORSO).toBe(0xd5dde5);
  expect(palette.RB_HEAD).toBe(0xe6edf3);
  expect(palette.RB_ANTENNA).toBe(0x556070);
  expect(palette.RB_WHITE).toBe(0xffffff);
});

it('RB_* konstanta terpisah dgn nilai mirip', () => {
  expect(palette.RB_TORSO).not.toBe(palette.RB_HEAD);
  expect(palette.RB_TORSO).not.toBe(palette.RB_ANTENNA);
  expect(palette.RB_WHITE).not.toBe(palette.RB_ANTENNA);
});

it('robot.js memakai RB_* di titik asalnya', () => {
  expect(src).toContain('shiny(RB_TORSO)');
  expect(src).toContain('shiny(RB_HEAD)');
  expect(src).toContain('shiny(RB_ANTENNA)');
  expect(src).toContain('MBT(RB_WHITE)');
  expect(src).toContain('MB(RB_WHITE)');
  expect(src).toContain('MB(facePlate)');
  expect(src).toContain('MB(screen)');
});

it('robot.js 0 literal hex tersisa', () => {
  expect(src.match(/0x[0-9A-Fa-f]{6}/g)).toBeNull();
});
