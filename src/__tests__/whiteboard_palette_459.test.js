import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

// Guard siklus 459: palet whiteboard satu sumber.
// WB_BG_COLOR / WB_BAR_TRACK_COLOR / WB_ITEM_TEXT nilai historis terkunci,
// whiteboard_canvas.js delegasi penuh + 0 literal warna.

const SRC = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'scene', 'parts', 'whiteboard_canvas.js'), 'utf8');

describe('whiteboard palette (459)', () => {
  it('nilai historis terkunci via palet', async () => {
    const p = await import('../lib/ui_palette.js');
    expect(p.WB_BG_COLOR).toBe('#fbfbfa');
    expect(p.WB_BAR_TRACK_COLOR).toBe('rgba(51,65,85,.18)');
    expect(p.WB_ITEM_TEXT).toBe('#334155');
  });

  it('anti-poisoning: delegasi, bukan literal', async () => {
    const wb = await import('../scene/parts/whiteboard_canvas.js');
    expect(wb.WB_BG).toBe('#fbfbfa');
    expect(wb.WB_BAR_TRACK).toBe('rgba(51,65,85,.18)');
    expect(wb.WB_ITEM_COLOR).toBe('#334155');
    expect(wb.WB_BG).not.toBe(wb.WB_ITEM_COLOR);
  });

  it('pemakaian di titik asal', () => {
    expect(SRC).toContain('WB_BG = WB_BG_COLOR');
    expect(SRC).toContain('WB_BAR_TRACK = WB_BAR_TRACK_COLOR');
    expect(SRC).toContain('WB_ITEM_COLOR = WB_ITEM_TEXT');
  });

  it('0 literal warna tersisa', () => {
    const code = SRC.split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
    const hits = code.match(/['"]#[0-9a-fA-F]{3,8}\b|rgba?\(/g) || [];
    expect(hits).toEqual([]);
  });
});
