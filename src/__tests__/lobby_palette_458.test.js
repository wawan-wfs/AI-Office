import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

// Guard siklus 458: palet layar lobi satu sumber.
// LS_BG reuse TV_BG_COLOR (#0A1628), LS_CLOCK reuse LC_TEXT (#FFFFFF) —
// nilai historis terkunci + delegasi penuh + 0 literal warna.

const SRC = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'scene', 'parts', 'lobby_screen.js'), 'utf8');

describe('lobby_screen palette (458)', () => {
  it('nilai historis terkunci via palet', async () => {
    const p = await import('../lib/ui_palette.js');
    expect(p.TV_BG_COLOR).toBe('#0A1628');
    expect(p.LC_TEXT).toBe('#FFFFFF');
  });

  it('anti-poisoning: delegasi, bukan literal', async () => {
    const ls = await import('../scene/parts/lobby_screen.js');
    expect(ls.LS_BG).toBe('#0A1628');
    expect(ls.LS_CLOCK).toBe('#FFFFFF');
    expect(ls.LS_BG).not.toBe(ls.LS_MUTED);
  });

  it('pemakaian di titik asal', () => {
    expect(SRC).toContain('LS_BG = TV_BG_COLOR');
    expect(SRC).toContain('LS_CLOCK = LC_TEXT');
  });

  it('0 literal warna tersisa', () => {
    const code = SRC.split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
    const hits = code.match(/['"]#[0-9a-fA-F]{3,8}\b/g) || [];
    expect(hits).toEqual([]);
  });
});
