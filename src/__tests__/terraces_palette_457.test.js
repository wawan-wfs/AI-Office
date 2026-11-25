// Siklus 457 — guard palet tint deck terraces: terraces.js delegasi penuh ke
// ui_palette.js (TERR_TINT_L1/L2/L3), nilai historis terkunci, 0 literal warna.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import {
  TERR_TINT_L2, TERR_TINT_L3, LC_TEXT,
} from '../lib/ui_palette.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(resolve(HERE, '../scene/parts/terraces.js'), 'utf8');

describe('siklus 457 — palet tint deck terraces satu sumber', () => {
  it('nilai historis terkunci di ui_palette', () => {
    expect(LC_TEXT).toBe('#FFFFFF');      // terazzo putih bervena (reuse LC_TEXT)
    expect(TERR_TINT_L2).toBe('#F7EFE0'); // oak blonde bervein lembut
    expect(TERR_TINT_L3).toBe('#44576E'); // slate biru eksekutif
  });

  it('anti-poisoning: tint string non-kosong & unik per lantai', () => {
    for (const c of [LC_TEXT, TERR_TINT_L2, TERR_TINT_L3]) {
      expect(typeof c).toBe('string');
      expect(c.startsWith('#')).toBe(true);
    }
    expect(LC_TEXT).not.toBe(TERR_TINT_L2);
    expect(TERR_TINT_L2).not.toBe(TERR_TINT_L3);
  });

  it('pemakaian di titik asal: terrazzoMat deck memakai konstanta palet', () => {
    expect(SRC).toContain('terrazzoMat(LC_TEXT');
    expect(SRC).toContain('terrazzoMat(TERR_TINT_L2');
    expect(SRC).toContain('terrazzoMat(TERR_TINT_L3');
    expect(SRC).not.toContain("'#FFFFFF'");
    expect(SRC).not.toContain("'#F7EFE0'");
    expect(SRC).not.toContain("'#44576E'");
  });

  it('0 literal warna hardcoded di terraces.js (di luar komentar)', () => {
    const code = SRC.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
    const literals = code.match(/'(#[0-9a-fA-F]{3,8})'/g) || [];
    expect(literals).toEqual([]);
  });
});
