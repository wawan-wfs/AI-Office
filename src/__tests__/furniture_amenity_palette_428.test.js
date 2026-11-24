import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as P from '../lib/ui_palette.js';

const src = readFileSync(resolve(__dirname, '../scene/parts/furniture.js'), 'utf8');

describe('furniture amenity palette single-source (siklus 428)', () => {
  it('nilai historis terkunci di ui_palette', () => {
    expect(P.AMEN_DISP_BODY).toBe(0xDFE6EE);
    expect(P.AMEN_DISP_BOTTLE).toBe(0x7FB8EA);
    expect(P.AMEN_DISP_TAP).toBe(0x4A6A86);
    expect(P.AMEN_POT_BASE).toBe(0xCFD8DC);
    expect(P.AMEN_LEAF_A).toBe(0x5FAE63);
    expect(P.AMEN_LEAF_B).toBe(0x2F7D3A);
    expect(P.AMEN_SHELF).toBe(0xCFD8E3);
    expect(P.AMEN_BOOK_SPINES).toEqual([0x3F7CF0, 0xE8504F, 0xF0A42A, 0x7A4CF5, 0x16C07A]);
    expect(P.AMEN_PRINT_BODY).toBe(0xB4B9BF);
    expect(P.AMEN_PRINT_MID).toBe(0xE2E5E8);
    expect(P.AMEN_PRINT_TOP).toBe(0xC7CCD1);
    expect(P.AMEN_PRINT_PAPER).toBe(0xFAFAFA);
    expect(P.AMEN_PRINT_DARK).toBe(0x2F3338);
    expect(P.AMEN_PRINT_LED).toBe(0x00E676);
    expect(P.AMEN_PRINT_SHEET).toBe(0xFFFFFF);
    expect(P.AMEN_SOFA_DARK).toBe(0x35454F);
    expect(P.AMEN_SOFA_CUSHION).toBe(0x475D69);
    expect(P.AMEN_SOFA_TRAY).toBe(0xDCE3EA);
    expect(P.AMEN_SOFA_LEG).toBe(0xB5C3D1);
    expect(P.AMEN_MAG_RED).toBe(0xFF5252);
    expect(P.AMEN_MAG_BLUE).toBe(0x448AFF);
    expect(P.AMEN_PANTRY_BODY).toBe(0xDDE4EC);
    expect(P.AMEN_PANTRY_TOP).toBe(0xE9EDF1);
    expect(P.AMEN_KOPI).toBe(0x30343A);
    expect(P.AMEN_KOPI_DARK).toBe(0x1F2226);
    expect(P.AMEN_KOPI_TRIM).toBe(0x666C72);
    expect(P.AMEN_KOPI_LED).toBe(0x0DEEF3);
    expect(P.AMEN_CUP).toBe(0xFFFFFF);
    expect(P.AMEN_JAR).toEqual([0xFF5252, 0xF5A623, 0x00E676]);
    expect(P.AMEN_PANTRY_BOX).toBe(0xE3E6E9);
    expect(P.AMEN_MICRO_PANEL).toBe(0x101214);
    expect(P.AMEN_POSTER_FRAME).toBe(0x262A31);
  });
  it('furniture.js delegasi penuh ke konstanta AMEN_*', () => {
    for (const name of ['AMEN_DISP_BODY','AMEN_DISP_BOTTLE','AMEN_DISP_TAP','AMEN_POT_BASE',
      'AMEN_LEAF_A','AMEN_LEAF_B','AMEN_BOOK_SPINES','AMEN_SHELF','AMEN_PRINT_BODY','AMEN_PRINT_MID',
      'AMEN_PRINT_TOP','AMEN_PRINT_PAPER','AMEN_PRINT_DARK','AMEN_PRINT_LED','AMEN_PRINT_SHEET',
      'AMEN_SOFA_DARK','AMEN_SOFA_CUSHION','AMEN_SOFA_TRAY','AMEN_SOFA_LEG','AMEN_MAG_RED','AMEN_MAG_BLUE',
      'AMEN_PANTRY_BODY','AMEN_PANTRY_TOP','AMEN_KOPI','AMEN_KOPI_DARK','AMEN_KOPI_TRIM','AMEN_KOPI_LED',
      'AMEN_CUP','AMEN_JAR','AMEN_PANTRY_BOX','AMEN_MICRO_PANEL','AMEN_POSTER_FRAME'])
      expect(src).toContain(name);
  });
  it('0 literal warna tersisa di furniture.js', () => {
    expect(src.match(/0x[0-9a-fA-F]{6}/g) || []).toEqual([]);
  });
  it('anti-poisoning: konstanta mirip tetap terpisah', () => {
    expect(P.AMEN_LEAF_A).not.toBe(P.AMEN_LEAF_B);
    expect(P.AMEN_SHELF).not.toBe(P.AMEN_POT_BASE);
    expect(P.AMEN_MAG_RED).not.toBe(P.AMEN_MAG_BLUE);
    expect(P.AMEN_KOPI).not.toBe(P.AMEN_KOPI_DARK);
    expect(P.AMEN_PRINT_PAPER).not.toBe(P.AMEN_PRINT_SHEET);
  });
});
