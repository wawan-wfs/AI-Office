import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as palette from '../lib/ui_palette.js';

const cafe = readFileSync(fileURLToPath(new URL('../scene/parts/cafe.js', import.meta.url)), 'utf8');
const lounge = readFileSync(fileURLToPath(new URL('../scene/parts/lounge.js', import.meta.url)), 'utf8');

it('CA_* terkunci nilai historis', () => {
  expect(palette.CA_COUNTER_WOOD).toBe(0x6D4C41);
  expect(palette.CA_COUNTERTOP).toBe(0xFFECB3);
  expect(palette.CA_ESPRESSO_BODY).toBe(0x263238);
  expect(palette.CA_ESPRESSO_LED).toBe(0x10E5A0);
  expect(palette.CA_STEAM).toBe(0xffffff);
  expect(palette.CA_KETTLE).toBe(0x90A4AE);
  expect(palette.CA_CUP_RED).toBe(0xEF5350);
  expect(palette.CA_CUP_WHITE).toBe(0xFAFAFA);
  expect(palette.CA_MENU_BACK).toBe(0x2A2A2A);
  expect(palette.CA_STOOL_SEAT).toBe(0xFB8C00);
  expect(palette.CA_STOOL_METAL).toBe(0x555555);
  expect(palette.CA_FRIDGE_BODY).toBe(0xECEFF1);
  expect(palette.CA_FRIDGE_GLOW).toBe(0x4FC3F7);
});

it('LG_* terkunci nilai historis & terpisah dari konstanta mirip', () => {
  expect(palette.LG_RUG_OUT).toBe(0x8D5524);
  expect(palette.LG_RUG_IN).toBe(0xC98A3D);
  expect(palette.LG_TABLE_WOOD).toBe(0x6D4C41);
  expect(palette.LG_TABLE_GLASS).toBe(0xB0BEC5);
  expect(palette.LG_LEG_WOOD).toBe(0x4E342E);
  expect(palette.LG_MAG_COVER).toBe(0xF4511E);
  expect(palette.LG_MUG).toBe(0xFAFAFA);
  expect(palette.LG_CHAIR_SHELL).toBe(0x00695C);
  expect(palette.LG_CHAIR_CUSHION).toBe(0x26A69A);
  expect(palette.LG_LAMP_POLE).toBe(0x37474F);
  expect(palette.LG_LAMP_SHADE).toBe(0xFFE0B2);
  expect(palette.LG_LAMP_BULB).toBe(0xFFC97A);
  expect(palette.LG_MAG_RACK).toBe(0x5D4037);
  expect(palette.LG_MAGS).toEqual([0xF4511E, 0x1E88E5, 0x43A047]);
  expect(palette.LG_TV_FRAME).toBe(0x101418);
  // anti-poisoning: konstanta dideklarasikan terpisah walau nilai sama
  const psrc = readFileSync(fileURLToPath(new URL('../lib/ui_palette.js', import.meta.url)), 'utf8');
  expect(psrc).toContain('LG_TABLE_WOOD = 0x6D4C41');
  expect(psrc).toContain('LG_MUG = 0xFAFAFA');
  expect(psrc).toContain('LG_MAG_COVER = 0xF4511E');
  expect(psrc).toContain('LG_MAGS = [0xF4511E');
});

it('cafe.js & lounge.js memakai konstanta di titik asalnya', () => {
  expect(cafe).toContain('M(CA_COUNTER_WOOD)');
  expect(cafe).toContain('M(CA_COUNTERTOP)');
  expect(cafe).toContain('MB(CA_ESPRESSO_LED)');
  expect(cafe).toContain('M(CA_STOOL_SEAT)');
  expect(cafe).toContain('MB(CA_FRIDGE_GLOW)');
  expect(lounge).toContain('M(LG_RUG_OUT,');
  expect(lounge).toContain('M(LG_CHAIR_SHELL)');
  expect(lounge).toContain('PointLight(LG_LAMP_BULB');
  expect(lounge).toContain('M(LG_MAG_RACK)');
  expect(lounge).toContain('LG_MAGS');
  expect(lounge).toContain('M(LG_TV_FRAME)');
});

it('cafe.js & lounge.js 0 literal hex tersisa', () => {
  expect(cafe.match(/0x[0-9A-Fa-f]{6}/g)).toBeNull();
  expect(lounge.match(/0x[0-9A-Fa-f]{6}/g)).toBeNull();
});
