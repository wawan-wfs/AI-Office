import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LBL_BODY_BG } from '../lib/ui_palette.js';

const root = process.cwd();
const spec = readFileSync(join(root, 'src', 'scene', 'parts', 'label_spec.js'), 'utf8');
const palette = readFileSync(join(root, 'src', 'lib', 'ui_palette.js'), 'utf8');

describe('Siklus 475 — badan label agent satu sumber', () => {
  it('LBL_BODY_BG terkunci nilai historis rgba(10,14,24,0.84)', () => {
    expect(LBL_BODY_BG).toBe('rgba(10,14,24,0.84)');
    expect(palette).toMatch(/export const LBL_BODY_BG = 'rgba\(10,14,24,0\.84\)';/);
  });

  it('drawLabelText memakai painter palet, bukan literal', () => {
    expect(spec).toMatch(/ctx\.fillStyle = LBL_BODY_BG;/);
    expect(spec).not.toMatch(/rgba\(10,14,24,0\.84\)/);
  });

  it('anti-poisoning — bukan LBL_TAIL_BG (alpha beda: 0.96 vs 0.84)', () => {
    expect(LBL_BODY_BG).not.toBe('rgba(10,14,24,0.96)');
  });

  it('konstanta tidak menggandakan literal di palet (masing-masing 1×)', () => {
    expect(palette.match(/rgba\(10,14,24,0\.84\)/g).length).toBe(1);
    expect(palette.match(/rgba\(10,14,24,0\.96\)/g).length).toBe(1);
  });
});
