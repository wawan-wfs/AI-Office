import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LBL_TAIL_BG } from '../lib/ui_palette.js';

const root = process.cwd();
const scene = readFileSync(join(root, 'src', 'scene', 'OfficeScene.js'), 'utf8');
const palette = readFileSync(join(root, 'src', 'lib', 'ui_palette.js'), 'utf8');

describe('Siklus 468 — ekor label agent satu sumber', () => {
  it('LBL_TAIL_BG terkunci nilai historis rgba(10,14,24,0.96)', () => {
    expect(LBL_TAIL_BG).toBe('rgba(10,14,24,0.96)');
    expect(palette).toMatch(/export const LBL_TAIL_BG = 'rgba\(10,14,24,0\.96\)';/);
  });

  it('ekor label memakai painter palet di titik asal', () => {
    expect(scene).toMatch(/c\.fillStyle = LBL_TAIL_BG;/);
  });

  it('anti-poisoning — bukan BUBBLE_BG (nilai beda: 7,16,32,.94)', () => {
    expect(LBL_TAIL_BG).not.toBe('rgba(7, 16, 32, 0.94)');
    expect(LBL_TAIL_BG).toBe('rgba(10,14,24,0.96)');
  });

  it('OfficeScene tidak lagi memakai literal ekor label', () => {
    expect(scene).not.toMatch(/rgba\(10,14,24,0\.96\)/);
  });
});
