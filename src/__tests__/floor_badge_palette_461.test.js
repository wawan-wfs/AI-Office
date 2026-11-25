// Siklus 461: palet plakat lantai satu sumber (FB_BG, teks misi reuse LB_TEXT).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { FB_BG, LB_TEXT } from '../lib/ui_palette.js';
import { drawFloorBadge } from '../scene/parts/floor_badge_canvas.js';

const SRC = readFileSync(fileURLToPath(new URL('../scene/parts/floor_badge_canvas.js', import.meta.url)), 'utf8');

describe('floor_badge_palette_461', () => {
  it('nilai terkunci (dasar FB_BG rgba, teks misi = LB_TEXT #fff)', () => {
    expect(FB_BG).toBe('rgba(6, 12, 26, 0.94)');
    expect(LB_TEXT).toBe('#fff');
    expect(SRC).toContain('FB_BG');
    expect(SRC).toContain('LB_TEXT');
  });

  it('anti-poisoning: delegasi ke ui_palette, bukan literal baru', () => {
    expect(SRC).toContain("from '../../lib/ui_palette.js'");
    expect(SRC).toContain('ctx.fillStyle = FB_BG');
    expect(SRC).toContain('ctx.fillStyle = LB_TEXT');
  });

  it('pemakaian painter di titik asal (fillStyle dasar & teks)', () => {
    const fills = [];
    const ctx = {
      canvas: {},
      beginPath: () => {},
      rect: () => {},
      fill: () => {},
      stroke: () => {},
      roundRect: () => {},
      fillText: () => {},
      set fillStyle(v) { fills.push(v); },
      get fillStyle() { return null; },
      set strokeStyle(v) {},
      get strokeStyle() { return null; },
      set font(v) {},
      get font() { return null; },
      set lineWidth(v) {},
      get lineWidth() { return 0; },
    };
    drawFloorBadge(ctx, '#10E5A0', 'L2', 'Misi uji');
    expect(fills[0]).toBe(FB_BG);   // dasar plakat
    expect(fills).toContain(LB_TEXT); // teks misi
  });

  it('0 literal warna pada floor_badge_canvas.js', () => {
    const literals = SRC.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    expect(literals).toEqual([]);
  });
});
