import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  RB_METAL, RB_DARK, RB_MID, RB_FACEPLATE, RB_SCREEN, RB_STATUS,
} from '../lib/ui_palette.js';
import { ROBOT_COLORS } from '../scene/parts/robot_spec.js';

describe('robot_palette_452 — palet robot satu sumber', () => {
  it('nilai terkunci historis (6 konstanta RB_*)', () => {
    expect({ RB_METAL, RB_DARK, RB_MID, RB_FACEPLATE, RB_SCREEN, RB_STATUS }).toEqual({
      RB_METAL: 0xdfe6ec,
      RB_DARK: 0x2a3340,
      RB_MID: 0x9aa7b4,
      RB_FACEPLATE: 0x07141a,
      RB_SCREEN: 0x050d12,
      RB_STATUS: 0xffffff,
    });
  });

  it('anti-poisoning: ROBOT_COLORS delegasi ke RB_* dengan nilai historis', () => {
    expect(ROBOT_COLORS).toEqual({
      metal: 0xdfe6ec,
      dark: 0x2a3340,
      mid: 0x9aa7b4,
      facePlate: 0x07141a,
      screen: 0x050d12,
    });
    expect(ROBOT_COLORS.metal).toBe(RB_METAL);
    expect(ROBOT_COLORS.dark).toBe(RB_DARK);
    expect(ROBOT_COLORS.mid).toBe(RB_MID);
    expect(ROBOT_COLORS.facePlate).toBe(RB_FACEPLATE);
    expect(ROBOT_COLORS.screen).toBe(RB_SCREEN);
  });

  it('pemakaian di titik asal: robot_spec.js delegasi ke konstanta RB_*', () => {
    const src = readFileSync(new URL('../scene/parts/robot_spec.js', import.meta.url), 'utf8');
    expect(src).toContain("from '../../lib/ui_palette.js'");
    expect(src).toContain('metal: RB_METAL');
    expect(src).toContain('facePlate: RB_FACEPLATE');
    expect(src).toContain('color: RB_STATUS');
  });

  it('robot_spec.js bebas literal warna hex', () => {
    const src = readFileSync(new URL('../scene/parts/robot_spec.js', import.meta.url), 'utf8');
    expect(src.match(/0x[0-9a-fA-F]{6}\b/g) ?? []).toHaveLength(0);
  });
});
