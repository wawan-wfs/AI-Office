// Guard palet muted kanvas scene satu sumber (siklus 315).
// `#8fa3bd` dulu literal inline di 6 titik painter (effects 2×, whiteboard 2×,
// projectboard 2×, projectboard_data 2×) plus diketik ulang di TV_MUTED/LS_MUTED.
// Sekarang satu titik kebenaran: SCENE_MUTED di src/lib/ui_palette.js.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SCENE_MUTED, MUTED_TEXT } from '../lib/ui_palette.js';
import { TV_MUTED } from '../scene/parts/tv_canvas.js';
import { LS_MUTED } from '../scene/parts/lobby_screen.js';

const root = process.cwd();
const read = (p) => readFileSync(join(root, p), 'utf8');

const PAINTERS = [
  'src/scene/parts/effects.js',
  'src/scene/parts/whiteboard_canvas.js',
  'src/scene/parts/projectboard.js',
  'src/scene/parts/projectboard_data.js',
  'src/scene/parts/tv_canvas.js',
  'src/scene/parts/lobby_screen.js',
];

describe('siklus 315 — warna muted kanvas scene satu sumber', () => {
  it('SCENE_MUTED terkunci ke nilai historis kanvas (#8fa3bd)', () => {
    expect(SCENE_MUTED).toBe('#8fa3bd');
    // BUKAN nilai teks muted UI (#8fa2c4) — dua peran berbeda, jangan disatukan.
    expect(SCENE_MUTED).not.toBe(MUTED_TEXT);
  });

  it('konstanta lokal TV_MUTED & LS_MUTED delegasi SCENE_MUTED (bukan salinan)', () => {
    expect(TV_MUTED).toBe(SCENE_MUTED);
    expect(LS_MUTED).toBe(SCENE_MUTED);
    expect(read('src/scene/parts/tv_canvas.js')).toContain('export const TV_MUTED = SCENE_MUTED;');
    expect(read('src/scene/parts/lobby_screen.js')).toContain('export const LS_MUTED = SCENE_MUTED;');
  });

  it('tidak ada literal #8fa3bd tersisa di painter kanvas scene', () => {
    for (const f of PAINTERS) {
      expect(read(f), f).not.toMatch(/#8fa3bd/i);
    }
  });

  it('setiap painter mengimpor SCENE_MUTED dari ui_palette', () => {
    for (const f of PAINTERS) {
      const src = read(f);
      expect(src, f).toMatch(/import \{[^}]*SCENE_MUTED[^}]*\} from '\.\.\/\.\.\/lib\/ui_palette\.js'/);
      expect((src.match(/SCENE_MUTED/g) || []).length, f).toBeGreaterThanOrEqual(2);
    }
  });
});
