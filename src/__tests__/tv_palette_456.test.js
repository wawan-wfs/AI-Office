// Siklus 456 — guard palet TV lounge: tv_canvas.js delegasi penuh ke
// ui_palette.js (TV_BG_COLOR/TV_GREEN_COLOR/TV_DIM_COLOR/TV_BAR_TRACK/
// TV_TEXT_WHITE), nilai historis terkunci, tanpa duplikat nilai.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import {
  TV_BG_COLOR, TV_DIM_COLOR, TV_BAR_TRACK, LB_TEXT, GREEN_ACCENT,
} from '../lib/ui_palette.js';
import {
  TV_BG, TV_GREEN, TV_BLUE, TV_RED, tvConnBadge, statusRows,
} from '../scene/parts/tv_canvas.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(resolve(HERE, '../scene/parts/tv_canvas.js'), 'utf8');

describe('siklus 456 — palet TV lounge satu sumber', () => {
  it('nilai historis terkunci di ui_palette', () => {
    expect(TV_BG_COLOR).toBe('#0A1628');
    expect(GREEN_ACCENT).toBe('#10E5A0'); // aksen brand TV reuse GREEN_ACCENT
    expect(TV_DIM_COLOR).toBe('#5b6b82');
    expect(TV_BAR_TRACK).toBe('rgba(255,255,255,.1)');
    expect(LB_TEXT).toBe('#fff'); // teks persen reuse LB_TEXT
  });

  it('anti-poisoning: delegasi tv_canvas identik dgn palet (bukan salinan drift)', () => {
    expect(TV_BG).toBe(TV_BG_COLOR);
    expect(TV_GREEN).toBe(GREEN_ACCENT);
    // TV_BLUE/TV_RED tetap delegasi status task (siklus 381)
    expect(TV_BLUE).not.toBe(TV_RED);
    expect(tvConnBadge('live').color).toBe(TV_GREEN);
  });

  it('pemakaian di titik asal: drawTvDashboard memakai konstanta palet', () => {
    expect(SRC).toContain('TV_BAR_TRACK');   // rel progress bar
    expect(SRC).toContain('LB_TEXT');       // teks persen
    expect(SRC).toContain('TV_DIM_COLOR');   // stempel update
    expect(SRC).not.toContain("'#0A1628'");
    expect(SRC).not.toContain("'#5b6b82'");
    expect(SRC).not.toContain("'rgba(255,255,255,.1)'");
  });

  it('0 literal warna hardcoded di tv_canvas.js (di luar komentar delegasi)', () => {
    const code = SRC.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
    const literals = code.match(/'(#[0-9a-fA-F]{3,8})'/g) || [];
    // sisa hex eksplisit yang sah: tidak ada — TV_BLUE/TV_RED via status colors
    expect(literals).toEqual([]);
  });
});
