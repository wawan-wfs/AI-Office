import { describe, it, expect } from 'vitest';
import {
  CLOCK_BG, CLOCK_RIM, CLOCK_PIN, HAND_HOUR_COLOR, HAND_MINUTE_COLOR,
} from '../lib/ui_palette.js';
import { HANDS } from '../scene/parts/clock_spec.js';
import { CLOCK_SIZE, CLOCK_CENTER, CLOCK_RIM_W, CLOCK_RIM_R, CLOCK_PIN_R } from '../scene/parts/clock_canvas.js';
import { readFileSync } from 'node:fs';

const uip = readFileSync(new URL('../lib/ui_palette.js', import.meta.url), 'utf8');
const cc = readFileSync(new URL('../scene/parts/clock_canvas.js', import.meta.url), 'utf8');
const cs = readFileSync(new URL('../scene/parts/clock_spec.js', import.meta.url), 'utf8');

describe('clock_palette_419 — palet jam dinding satu sumber', () => {
  it('nilai historis terkunci', () => {
    expect(CLOCK_BG).toBe('#fafafa');
    expect(CLOCK_RIM).toBe('#2a2f36');
    expect(CLOCK_PIN).toBe('#f97316');
    expect(HAND_HOUR_COLOR).toBe('#222');
    expect(HAND_MINUTE_COLOR).toBe('#444');
  });

  it('jarum delegasi ke palet', () => {
    expect(HANDS.hour.color).toBe(HAND_HOUR_COLOR);
    expect(HANDS.minute.color).toBe(HAND_MINUTE_COLOR);
    expect(HANDS.second.color).toBe(CLOCK_PIN);
  });

  it('geometri jam tak berubah', () => {
    expect(CLOCK_SIZE).toBe(96);
    expect(CLOCK_CENTER).toBe(48);
    expect(CLOCK_RIM_W).toBe(3);
    expect(CLOCK_RIM_R).toBe(45);
    expect(CLOCK_PIN_R).toBe(3);
  });

  it('0 literal warna palet tersisa di clock_canvas/clock_spec & ui_palette satu definisi', () => {
    for (const src of [cc, cs]) {
      expect(src).not.toMatch(/#(?:fafafa|2a2f36|f97316)/);
    }
    for (const v of ['#fafafa', '#2a2f36', '#f97316']) {
      // 1× di komentar literatur siklus 419 + 1× definisi konstanta
      expect(uip.split(v).length - 1).toBe(2);
    }
  });
});
