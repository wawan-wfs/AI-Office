// Guard siklus 447: palet tanda dekoratif satu sumber via ui_palette.
// SG_* nilai baru terkunci; warna welcome/menu reuse konstanta UI lama (LC_*/AMBER_ACCENT).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as pal from '../../lib/ui_palette.js';

const root = resolve(import.meta.dirname, '../..');
const palSrc = readFileSync(resolve(root, 'lib/ui_palette.js'), 'utf8');
const scSrc = readFileSync(resolve(root, 'scene/parts/sign_canvas.js'), 'utf8');

describe('tanda dekoratif palette (siklus 447)', () => {
  it('SG_* terkunci nilai historis', () => {
    expect(pal.SG_MENU_BG).toBe('#1A1A2E');
    expect(pal.SG_MENU_HI).toBe('#FFE082');
    expect(pal.SG_MENU_TEXT).toBe('#EEE');
    expect(pal.SG_POSTER_BG).toBe('#0f1a2e');
  });

  it('anti-poisoning: konstanta primitif, bukan hasil ekspresi', () => {
    for (const k of ['SG_MENU_BG', 'SG_MENU_HI', 'SG_MENU_TEXT', 'SG_POSTER_BG']) {
      expect(typeof pal[k], k).toBe('string');
    }
    expect(palSrc).toMatch(/export const SG_POSTER_BG = '#0f1a2e';/);
    // reuse warna UI lama — tidak ada duplikat nilai di palette
    expect(pal.AMBER_ACCENT).toBe('#F59E0B');
    expect(pal.LC_BG).toBe('#0F1B2E');
    expect(pal.LC_FRAME).toBe('#D4AF37');
    expect(pal.LC_GRAD_A).toBe('#FBBF24');
    expect(pal.LC_TEXT).toBe('#FFFFFF');
  });

  it('pemakaian di titik asal: sign_canvas.js delegasi SG_*/LC_*/AMBER', () => {
    expect(scSrc).toMatch(/SG_MENU_HI : SG_MENU_TEXT/);
    expect(scSrc).toMatch(/LC_FRAME; n\.lineWidth = 10/);
    expect(scSrc).toMatch(/LC_GRAD_A; n\.font/);
    expect(scSrc).toMatch(/AMBER_ACCENT; c\.fillText\('WFS CAFÉ'/);
  });

  it('0 literal warna tersisa di sign_canvas.js (komentar dikecualikan)', () => {
    const code = scSrc.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
    expect(code).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
