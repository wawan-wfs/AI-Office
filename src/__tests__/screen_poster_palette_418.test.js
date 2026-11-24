import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  AMBER_ACCENT, PINK_ACCENT, SKY_DIVISION, EMERALD_ACCENT,
  SCREEN_BG, SCREEN_OK, SCREEN_WARN, SCREEN_INFO, SCREEN_FAIL, SCREEN_PALETTE,
} from '../lib/ui_palette.js';
import { POSTER_SLOGANS, posterSloganFor } from '../scene/parts/effects.js';

const src = (f) => readFileSync(resolve(__dirname, '..', f), 'utf8');

describe('siklus 418 — palet layar monitor & poster satu sumber', () => {
  it('nilai historis palet layar terkunci (tampilan tak berubah)', () => {
    expect(SCREEN_BG).toBe('#0b1220');
    expect(SCREEN_OK).toBe('#4ade80');
    expect(SCREEN_WARN).toBe('#fbbf24');
    expect(SCREEN_INFO).toBe('#60a5fa');
    expect(SCREEN_FAIL).toBe('#f87171');
    expect(SCREEN_PALETTE).toEqual(['#e879f9', '#fb7185', '#8b5cf6', '#60a5fa', '#22d3ee', '#4ade80']);
    expect(PINK_ACCENT).toBe('#F472B6');
    expect(EMERALD_ACCENT).toBe('#34D399');
    expect(SKY_DIVISION).toBe('#38BDF8');
    expect(AMBER_ACCENT).toBe('#F59E0B');
  });

  it('0 literal warna palet layar tersisa di effects.js', () => {
    const s = src('scene/parts/effects.js');
    for (const lit of ['#0b1220', '#4ade80', '#fbbf24', '#f87171', '#e879f9', '#fb7185', '#8b5cf6', '#22d3ee', '#F59E0B', '#F472B6', '#38BDF8', '#34D399']) {
      expect(s).not.toContain(lit);
    }
    expect(s).not.toMatch(/'#fff'/);
  });

  it('POSTER_SLOGANS delegasi penuh ke konstanta ui_palette', () => {
    expect(POSTER_SLOGANS).toEqual([
      ['SHIP IT', AMBER_ACCENT],
      ['CODE\nCOFFEE', PINK_ACCENT],
      ['BUILD\nDAILY', SKY_DIVISION],
      ['SHIP\nVALUE', EMERALD_ACCENT],
    ]);
    // kontrak lama tetap
    expect(posterSloganFor(0, 0)).toEqual(['SHIP IT', '#F59E0B']);
  });

  it('decor.js poster base delegasi (0 literal amber/pink)', () => {
    const s = src('scene/parts/decor.js');
    expect(s).not.toContain('#F59E0B');
    expect(s).not.toContain('#F472B6');
    expect(s).toContain('AMBER_ACCENT');
    expect(s).toContain('PINK_ACCENT');
  });
});
